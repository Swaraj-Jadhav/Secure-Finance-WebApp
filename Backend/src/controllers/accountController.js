const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class AccountController {
  // Get all user accounts
  async getAccounts(req, res) {
    try {
      const { type, status } = req.query;
      
      const query = { userId: req.userId };
      if (type) query.accountType = type;
      if (status) query.status = status;

      const accounts = await Account.find(query).sort({ createdAt: -1 });

      res.json({
        success: true,
        data: { accounts }
      });

    } catch (error) {
      logger.error('Get accounts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch accounts',
        code: 'ACCOUNTS_FETCH_FAILED'
      });
    }
  }

  // Get single account
  async getAccount(req, res) {
    try {
      const account = await Account.findOne({
        _id: req.params.id,
        userId: req.userId
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found',
          code: 'ACCOUNT_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: { account }
      });

    } catch (error) {
      logger.error('Get account error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch account',
        code: 'ACCOUNT_FETCH_FAILED'
      });
    }
  }

  // Create new account
  async createAccount(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { accountName, accountType, category, initialBalance = 0, currency = 'USD' } = req.body;

      // Check if user already has a primary account
      if (accountType === 'primary') {
        const existingPrimary = await Account.findOne({
          userId: req.userId,
          isPrimary: true,
          status: 'active'
        });

        if (existingPrimary) {
          return res.status(400).json({
            success: false,
            message: 'User already has a primary account',
            code: 'PRIMARY_ACCOUNT_EXISTS'
          });
        }
      }

      // For virtual accounts, check if user has sufficient balance in primary account
      if (accountType === 'virtual' && initialBalance > 0) {
        const primaryAccount = await Account.findOne({
          userId: req.userId,
          isPrimary: true,
          status: 'active'
        });

        if (!primaryAccount) {
          return res.status(400).json({
            success: false,
            message: 'Primary account required to create virtual account',
            code: 'PRIMARY_ACCOUNT_REQUIRED'
          });
        }

        if (primaryAccount.availableBalance < initialBalance) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient balance in primary account',
            code: 'INSUFFICIENT_BALANCE'
          });
        }
      }

      // Create account
      const account = new Account({
        userId: req.userId,
        accountName,
        accountType,
        category,
        balance: initialBalance,
        availableBalance: initialBalance,
        currency,
        isPrimary: accountType === 'primary'
      });

      await account.save();

      // If virtual account with initial balance, transfer from primary
      if (accountType === 'virtual' && initialBalance > 0) {
        const primaryAccount = await Account.findOne({
          userId: req.userId,
          isPrimary: true,
          status: 'active'
        });

        // Update primary account balance
        primaryAccount.balance -= initialBalance;
        primaryAccount.availableBalance -= initialBalance;
        await primaryAccount.save();

        // Create transaction record
        const transaction = new Transaction({
          transactionId: `TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`,
          userId: req.userId,
          fromAccount: primaryAccount._id,
          toAccount: account._id,
          amount: initialBalance,
          type: 'transfer',
          category: 'transfer',
          description: `Initial funding for ${accountName}`,
          status: 'completed',
          processedAt: new Date()
        });

        await transaction.save();
      }

      logger.info(`Account created: ${account.accountName} for user ${req.userId}`);

      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: { account }
      });

    } catch (error) {
      logger.error('Create account error:', error);
      res.status(500).json({
        success: false,
        message: 'Account creation failed',
        code: 'ACCOUNT_CREATION_FAILED'
      });
    }
  }

  // Update account
  async updateAccount(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const account = await Account.findOne({
        _id: req.params.id,
        userId: req.userId
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found',
          code: 'ACCOUNT_NOT_FOUND'
        });
      }

      // Prevent updating primary account type
      if (req.body.accountType && account.isPrimary && req.body.accountType !== 'primary') {
        return res.status(400).json({
          success: false,
          message: 'Cannot change primary account type',
          code: 'PRIMARY_ACCOUNT_TYPE_IMMUTABLE'
        });
      }

      const allowedUpdates = ['accountName', 'settings', 'metadata'];
      const updates = {};

      allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const updatedAccount = await Account.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      logger.info(`Account updated: ${updatedAccount.accountName} for user ${req.userId}`);

      res.json({
        success: true,
        message: 'Account updated successfully',
        data: { account: updatedAccount }
      });

    } catch (error) {
      logger.error('Update account error:', error);
      res.status(500).json({
        success: false,
        message: 'Account update failed',
        code: 'ACCOUNT_UPDATE_FAILED'
      });
    }
  }

  // Delete account
  async deleteAccount(req, res) {
    try {
      const account = await Account.findOne({
        _id: req.params.id,
        userId: req.userId
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found',
          code: 'ACCOUNT_NOT_FOUND'
        });
      }

      // Prevent deleting primary account
      if (account.isPrimary) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete primary account',
          code: 'PRIMARY_ACCOUNT_DELETE_FORBIDDEN'
        });
      }

      // For virtual accounts, return funds to primary account
      if (account.accountType === 'virtual' && account.balance > 0) {
        const primaryAccount = await Account.findOne({
          userId: req.userId,
          isPrimary: true,
          status: 'active'
        });

        if (primaryAccount) {
          // Update primary account balance
          primaryAccount.balance += account.balance;
          primaryAccount.availableBalance += account.balance;
          await primaryAccount.save();

          // Create transaction record
          const transaction = new Transaction({
            transactionId: `TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`,
            userId: req.userId,
            fromAccount: account._id,
            toAccount: primaryAccount._id,
            amount: account.balance,
            type: 'transfer',
            category: 'transfer',
            description: `Account closure - funds returned to primary account`,
            status: 'completed',
            processedAt: new Date()
          });

          await transaction.save();
        }
      }

      // Soft delete by changing status
      account.status = 'closed';
      await account.save();

      logger.info(`Account deleted: ${account.accountName} for user ${req.userId}`);

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });

    } catch (error) {
      logger.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        message: 'Account deletion failed',
        code: 'ACCOUNT_DELETION_FAILED'
      });
    }
  }

  // Transfer money between accounts
  async transferMoney(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { fromAccountId, toAccountId, amount, description } = req.body;

      // Validate accounts exist and belong to user
      const fromAccount = await Account.findOne({
        _id: fromAccountId,
        userId: req.userId,
        status: 'active'
      });

      const toAccount = await Account.findOne({
        _id: toAccountId,
        userId: req.userId,
        status: 'active'
      });

      if (!fromAccount) {
        return res.status(404).json({
          success: false,
          message: 'Source account not found',
          code: 'SOURCE_ACCOUNT_NOT_FOUND'
        });
      }

      if (!toAccount) {
        return res.status(404).json({
          success: false,
          message: 'Destination account not found',
          code: 'DESTINATION_ACCOUNT_NOT_FOUND'
        });
      }

      if (fromAccountId === toAccountId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot transfer to the same account',
          code: 'SAME_ACCOUNT_TRANSFER'
        });
      }

      // Check sufficient balance
      if (!fromAccount.hasSufficientBalance(amount)) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance',
          code: 'INSUFFICIENT_BALANCE'
        });
      }

      // Perform transfer
      await fromAccount.updateBalance(amount, 'debit');
      await toAccount.updateBalance(amount, 'credit');

      // Create transaction record
      const transaction = new Transaction({
        transactionId: `TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`,
        userId: req.userId,
        fromAccount: fromAccountId,
        toAccount: toAccountId,
        amount,
        type: 'transfer',
        category: 'transfer',
        description: description || `Transfer from ${fromAccount.accountName} to ${toAccount.accountName}`,
        status: 'completed',
        processedAt: new Date()
      });

      await transaction.save();

      // Fetch updated accounts
      const updatedFromAccount = await Account.findById(fromAccountId);
      const updatedToAccount = await Account.findById(toAccountId);

      logger.info(`Transfer completed: $${amount} from ${fromAccount.accountName} to ${toAccount.accountName}`);

      res.json({
        success: true,
        message: 'Transfer completed successfully',
        data: {
          transaction,
          fromAccount: updatedFromAccount,
          toAccount: updatedToAccount
        }
      });

    } catch (error) {
      logger.error('Transfer money error:', error);
      res.status(500).json({
        success: false,
        message: 'Transfer failed',
        code: 'TRANSFER_FAILED'
      });
    }
  }

  // Get account transactions
  async getAccountTransactions(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, type, status } = req.query;

      const account = await Account.findOne({
        _id: id,
        userId: req.userId
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found',
          code: 'ACCOUNT_NOT_FOUND'
        });
      }

      const query = {
        userId: req.userId,
        $or: [
          { fromAccount: id },
          { toAccount: id }
        ]
      };

      if (type) query.type = type;
      if (status) query.status = status;

      const transactions = await Transaction.find(query)
        .populate('fromAccount', 'accountName accountNumber')
        .populate('toAccount', 'accountName accountNumber')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Transaction.countDocuments(query);

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      logger.error('Get account transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch account transactions',
        code: 'TRANSACTIONS_FETCH_FAILED'
      });
    }
  }

  // Get account summary
  async getAccountSummary(req, res) {
    try {
      const { id } = req.params;

      const account = await Account.findOne({
        _id: id,
        userId: req.userId
      });

      if (!account) {
        return res.status(404).json({
          success: false,
          message: 'Account not found',
          code: 'ACCOUNT_NOT_FOUND'
        });
      }

      // Get transaction summary for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const summary = await Transaction.getTransactionSummary(
        req.userId,
        thirtyDaysAgo,
        new Date()
      );

      res.json({
        success: true,
        data: {
          account,
          summary: summary[0] || {
            totalIncome: 0,
            totalExpenses: 0,
            totalTransactions: 0,
            averageTransaction: 0
          }
        }
      });

    } catch (error) {
      logger.error('Get account summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch account summary',
        code: 'SUMMARY_FETCH_FAILED'
      });
    }
  }
}

module.exports = new AccountController();
