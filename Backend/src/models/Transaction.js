const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: function() {
      return this.type !== 'deposit' && this.type !== 'income';
    }
  },
  toAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: function() {
      return this.type !== 'withdrawal' && this.type !== 'expense';
    }
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
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'payment', 'income', 'expense', 'fee', 'refund'],
    required: true
  },
  category: {
    type: String,
    enum: [
      'groceries', 'utilities', 'transportation', 'entertainment', 'healthcare',
      'education', 'shopping', 'dining', 'travel', 'insurance', 'investment',
      'salary', 'bonus', 'freelance', 'rent', 'mortgage', 'loan', 'other'
    ],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  merchant: {
    name: String,
    category: String,
    location: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'reversed'],
    default: 'pending'
  },
  reference: {
    type: String,
    trim: true
  },
  tags: [String],
  metadata: {
    originalAmount: Number,
    exchangeRate: Number,
    fees: {
      processing: { type: Number, default: 0 },
      currency: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
      city: String,
      country: String
    },
    device: {
      type: String,
      os: String,
      browser: String,
      ip: String
    }
  },
  scheduledDate: {
    type: Date
  },
  processedAt: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 500
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Virtual for transaction display name
transactionSchema.virtual('displayName').get(function() {
  return this.description || `${this.type} transaction`;
});

// Index for better query performance
transactionSchema.index({ userId: 1, createdAt: -1 });
// transactionId has a unique field-level index; avoid duplicating here
transactionSchema.index({ fromAccount: 1 });
transactionSchema.index({ toAccount: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ amount: 1 });
transactionSchema.index({ createdAt: -1 });

// Pre-save middleware to generate transaction ID
transactionSchema.pre('save', function(next) {
  if (this.isNew && !this.transactionId) {
    this.transactionId = this.generateTransactionId();
  }
  next();
});

// Method to generate transaction ID
transactionSchema.methods.generateTransactionId = function() {
  const timestamp = Date.now().toString();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `TXN${timestamp}${random}`;
};

// Method to mark as completed
transactionSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.processedAt = new Date();
  return this.save();
};

// Method to mark as failed
transactionSchema.methods.markFailed = function(reason) {
  this.status = 'failed';
  this.notes = reason;
  return this.save();
};

// Method to calculate total fees
transactionSchema.methods.getTotalFees = function() {
  const fees = this.metadata.fees || {};
  return (fees.processing || 0) + (fees.currency || 0) + (fees.other || 0);
};

// Static method to get user transactions
transactionSchema.statics.getUserTransactions = function(userId, options = {}) {
  const {
    limit = 50,
    skip = 0,
    type,
    category,
    status,
    startDate,
    endDate,
    minAmount,
    maxAmount
  } = options;

  const query = { userId };

  if (type) query.type = type;
  if (category) query.category = category;
  if (status) query.status = status;
  if (minAmount || maxAmount) {
    query.amount = {};
    if (minAmount) query.amount.$gte = minAmount;
    if (maxAmount) query.amount.$lte = maxAmount;
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  return this.find(query)
    .populate('fromAccount', 'accountName accountNumber')
    .populate('toAccount', 'accountName accountNumber')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get transaction summary
transactionSchema.statics.getTransactionSummary = function(userId, startDate, endDate) {
  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId),
    status: 'completed'
  };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [
              { $in: ['$type', ['deposit', 'income', 'refund']] },
              '$amount',
              0
            ]
          }
        },
        totalExpenses: {
          $sum: {
            $cond: [
              { $in: ['$type', ['withdrawal', 'expense', 'payment', 'fee']] },
              '$amount',
              0
            ]
          }
        },
        totalTransactions: { $sum: 1 },
        averageTransaction: { $avg: '$amount' },
        categories: {
          $push: {
            category: '$category',
            amount: '$amount',
            type: '$type'
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Transaction', transactionSchema);
