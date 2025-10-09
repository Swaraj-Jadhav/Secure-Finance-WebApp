const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: [
      'groceries', 'utilities', 'transportation', 'entertainment', 'healthcare',
      'education', 'shopping', 'dining', 'travel', 'insurance', 'rent',
      'mortgage', 'loan', 'subscriptions', 'other'
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      required: function() {
        return this.recurring.isRecurring;
      }
    },
    endDate: {
      type: Date
    },
    nextDueDate: {
      type: Date
    }
  },
  budget: {
    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Budget'
    },
    isOverBudget: {
      type: Boolean,
      default: false
    }
  },
  tags: [String],
  location: {
    name: String,
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'digital_wallet', 'check', 'other'],
    default: 'card'
  },
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }],
  notes: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'disputed', 'refunded'],
    default: 'confirmed'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted amount
expenseSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Index for better query performance
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ category: 1 });
expenseSchema.index({ amount: 1 });
expenseSchema.index({ date: -1 });
expenseSchema.index({ 'recurring.isRecurring': 1 });

// Static method to get expenses by date range
expenseSchema.statics.getExpensesByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ date: -1 });
};

// Static method to get expenses by category
expenseSchema.statics.getExpensesByCategory = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        averageAmount: { $avg: '$amount' },
        expenses: { $push: '$$ROOT' }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
};

// Static method to get monthly expense summary
expenseSchema.statics.getMonthlySummary = function(userId, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: '$amount' },
        totalTransactions: { $sum: 1 },
        averageExpense: { $avg: '$amount' },
        categories: {
          $push: {
            category: '$category',
            amount: '$amount'
          }
        }
      }
    }
  ]);
};

// Static method to get recurring expenses
expenseSchema.statics.getRecurringExpenses = function(userId) {
  return this.find({
    userId,
    'recurring.isRecurring': true,
    $or: [
      { 'recurring.endDate': { $exists: false } },
      { 'recurring.endDate': { $gt: new Date() } }
    ]
  }).sort({ 'recurring.nextDueDate': 1 });
};

module.exports = mongoose.model('Expense', expenseSchema);
