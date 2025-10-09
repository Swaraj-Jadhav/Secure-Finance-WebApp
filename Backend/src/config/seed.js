require('dotenv').config();
const database = require('./database');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const logger = require('../utils/logger');

const seedData = async () => {
  try {
    await database.connect();
    
    // Clear existing data
    await User.deleteMany({});
    await Account.deleteMany({});
    await Transaction.deleteMany({});
    await Expense.deleteMany({});
    await Budget.deleteMany({});

    logger.info('Cleared existing data');

    // Create demo user
    const demoUser = new User({
      username: 'admin',
      email: 'admin@securefinance.com',
      password: 'SecureBank2025!',
      firstName: 'Admin',
      lastName: 'User',
      phone: '+1234567890',
      dateOfBirth: new Date('1990-01-01'),
      isEmailVerified: true,
      isPhoneVerified: true,
      isMFAEnabled: true
    });

    await demoUser.save();
    logger.info('Created demo user');

    // Create primary account
    const primaryAccount = new Account({
      userId: demoUser._id,
      accountName: 'Primary Checking',
      accountType: 'primary',
      category: 'checking',
      balance: 15420.50,
      availableBalance: 15420.50,
      isPrimary: true,
      metadata: {
        icon: '💳',
        color: 'bg-blue-500'
      }
    });

    await primaryAccount.save();
    logger.info('Created primary account');

    // Create virtual accounts
    const virtualAccounts = [
      {
        accountName: 'High Yield Savings',
        category: 'savings',
        balance: 45780.25,
        metadata: { icon: '💰', color: 'bg-green-600' }
      },
      {
        accountName: 'Investment Portfolio',
        category: 'investment',
        balance: 128950.75,
        metadata: { icon: '📈', color: 'bg-purple-500' }
      },
      {
        accountName: 'Emergency Fund',
        category: 'emergency',
        balance: 10000.00,
        metadata: { icon: '🛡️', color: 'bg-red-500' }
      }
    ];

    for (const accountData of virtualAccounts) {
      const account = new Account({
        userId: demoUser._id,
        accountType: 'virtual',
        ...accountData,
        availableBalance: accountData.balance
      });
      await account.save();
    }

    logger.info('Created virtual accounts');

    // Create sample transactions
    const transactions = [
      {
        userId: demoUser._id,
        fromAccount: primaryAccount._id,
        amount: -500.00,
        type: 'withdrawal',
        category: 'transfer',
        description: 'Internal Transfer',
        status: 'completed',
        processedAt: new Date()
      },
      {
        userId: demoUser._id,
        fromAccount: primaryAccount._id,
        amount: -89.99,
        type: 'expense',
        category: 'shopping',
        description: 'Amazon Marketplace',
        status: 'completed',
        processedAt: new Date()
      },
      {
        userId: demoUser._id,
        toAccount: primaryAccount._id,
        amount: 3500.00,
        type: 'income',
        category: 'salary',
        description: 'Salary Direct Deposit',
        status: 'completed',
        processedAt: new Date()
      },
      {
        userId: demoUser._id,
        fromAccount: primaryAccount._id,
        amount: -125.50,
        type: 'expense',
        category: 'utilities',
        description: 'Electric Company',
        status: 'completed',
        processedAt: new Date()
      },
      {
        userId: demoUser._id,
        fromAccount: primaryAccount._id,
        amount: -1200.00,
        type: 'expense',
        category: 'investment',
        description: 'Stock Purchase - AAPL',
        status: 'completed',
        processedAt: new Date()
      }
    ];

    for (const transactionData of transactions) {
      const transaction = new Transaction(transactionData);
      await transaction.save();
    }

    logger.info('Created sample transactions');

    // Create sample expenses
    const expenses = [
      {
        userId: demoUser._id,
        category: 'groceries',
        amount: 450.75,
        description: 'Weekly grocery shopping',
        date: new Date()
      },
      {
        userId: demoUser._id,
        category: 'utilities',
        amount: 320.50,
        description: 'Monthly utilities bill',
        date: new Date()
      },
      {
        userId: demoUser._id,
        category: 'dining',
        amount: 280.25,
        description: 'Restaurant meals',
        date: new Date()
      },
      {
        userId: demoUser._id,
        category: 'transportation',
        amount: 195.00,
        description: 'Gas and public transport',
        date: new Date()
      },
      {
        userId: demoUser._id,
        category: 'entertainment',
        amount: 150.75,
        description: 'Movies and streaming',
        date: new Date()
      }
    ];

    for (const expenseData of expenses) {
      const expense = new Expense(expenseData);
      await expense.save();
    }

    logger.info('Created sample expenses');

    // Create sample budget
    const budget = new Budget({
      userId: demoUser._id,
      name: 'Monthly Budget 2025',
      description: 'Main monthly budget for 2025',
      period: 'monthly',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
      totalBudget: 5000,
      categories: [
        { category: 'groceries', budgetedAmount: 800, spentAmount: 450.75 },
        { category: 'utilities', budgetedAmount: 400, spentAmount: 320.50 },
        { category: 'dining', budgetedAmount: 300, spentAmount: 280.25 },
        { category: 'transportation', budgetedAmount: 250, spentAmount: 195.00 },
        { category: 'entertainment', budgetedAmount: 200, spentAmount: 150.75 }
      ]
    });

    await budget.save();
    logger.info('Created sample budget');

    logger.info('Database seeded successfully!');
    console.log('\n=== DEMO CREDENTIALS ===');
    console.log('Username: admin');
    console.log('Password: SecureBank2025!');
    console.log('MFA Code: 123456');
    console.log('========================\n');

  } catch (error) {
    logger.error('Seeding error:', error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

seedData();
