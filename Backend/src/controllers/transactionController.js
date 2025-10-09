const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class TransactionController {
  // Get all user transactions
  async getTransactions(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        category,
        status,
        startDate,
        endDate,
        minAmount,
        maxAmount
      } = req.query;

      const options = {
        limit: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        type,
        category,
        status,
        startDate,
        endDate,
        minAmount: minAmount ? parseFloat(minAmount) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount) : undefined
      };

      const transactions = await Transaction.getUserTransactions(req.userId, options);
      const total = await Transaction.countDocuments({ userId: req.userId });

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
      logger.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
        code: 'TRANSACTIONS_FETCH_FAILED'
      });
    }
  }

  // Get single transaction
  async getTransaction(req, res) {
    try {
      const transaction = await Transaction.findOne({
        _id: req.params.id,
        userId: req.userId
      }).populate('fromAccount', 'accountName accountNumber')
        .populate('toAccount', 'accountName accountNumber');

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
          code: 'TRANSACTION_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: { transaction }
      });

    } catch (error) {
      logger.error('Get transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction',
        code: 'TRANSACTION_FETCH_FAILED'
      });
    }
  }

  // Create new transaction
  async createTransaction(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { fromAccount, toAccount, amount, type, category, description } = req.body;

      // Validate accounts if provided
      if (fromAccount) {
        const fromAccountDoc = await Account.findOne({
          _id: fromAccount,
          userId: req.userId,
          status: 'active'
        });

        if (!fromAccountDoc) {
          return res.status(404).json({
            success: false,
            message: 'Source account not found',
            code: 'SOURCE_ACCOUNT_NOT_FOUND'
          });
        }

        if (!fromAccountDoc.hasSufficientBalance(amount)) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient balance',
            code: 'INSUFFICIENT_BALANCE'
          });
        }
      }

      if (toAccount) {
        const toAccountDoc = await Account.findOne({
          _id: toAccount,
          userId: req.userId,
          status: 'active'
        });

        if (!toAccountDoc) {
          return res.status(404).json({
            success: false,
            message: 'Destination account not found',
            code: 'DESTINATION_ACCOUNT_NOT_FOUND'
          });
        }
      }

      // Create transaction
      const transaction = new Transaction({
        userId: req.userId,
        fromAccount,
        toAccount,
        amount,
        type,
        category,
        description,
        status: 'pending'
      });

      await transaction.save();

      // Process transaction based on type
      if (type === 'deposit' && toAccount) {
        const toAccountDoc = await Account.findById(toAccount);
        await toAccountDoc.updateBalance(amount, 'credit');
        await transaction.markCompleted();
      } else if (type === 'withdrawal' && fromAccount) {
        const fromAccountDoc = await Account.findById(fromAccount);
        await fromAccountDoc.updateBalance(amount, 'debit');
        await transaction.markCompleted();
      } else if (type === 'transfer' && fromAccount && toAccount) {
        const fromAccountDoc = await Account.findById(fromAccount);
        const toAccountDoc = await Account.findById(toAccount);
        
        await fromAccountDoc.updateBalance(amount, 'debit');
        await toAccountDoc.updateBalance(amount, 'credit');
        await transaction.markCompleted();
      }

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: { transaction }
      });

    } catch (error) {
      logger.error('Create transaction error:', error);
      res.status(500).json({
        success: false,
        message: 'Transaction creation failed',
        code: 'TRANSACTION_CREATION_FAILED'
      });
    }
  }

  // Get transaction summary
  async getTransactionSummary(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const summary = await Transaction.getTransactionSummary(
        req.userId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      res.json({
        success: true,
        data: { summary: summary[0] || {} }
      });

    } catch (error) {
      logger.error('Get transaction summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transaction summary',
        code: 'SUMMARY_FETCH_FAILED'
      });
    }
  }
}

module.exports = new TransactionController();
