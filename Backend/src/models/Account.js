const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  accountName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  accountType: {
    type: String,
    enum: ['primary', 'savings', 'checking', 'investment', 'virtual'],
    required: true
  },
  category: {
    type: String,
    enum: ['checking', 'savings', 'investment', 'travel', 'emergency', 'education', 'business', 'personal'],
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  availableBalance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'closed'],
    default: 'active'
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  interestRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  minimumBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  overdraftLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  monthlyFee: {
    type: Number,
    default: 0,
    min: 0
  },
  lastTransactionDate: {
    type: Date
  },
  metadata: {
    icon: String,
    color: String,
    description: String,
    tags: [String]
  },
  settings: {
    allowOverdraft: { type: Boolean, default: false },
    autoTransfer: { type: Boolean, default: false },
    notifications: {
      lowBalance: { type: Boolean, default: true },
      transactions: { type: Boolean, default: true },
      fees: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for account display name
accountSchema.virtual('displayName').get(function() {
  return `${this.accountName} (${this.accountNumber.slice(-4)})`;
});

// Virtual for balance with currency
accountSchema.virtual('formattedBalance').get(function() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.currency
  }).format(this.balance);
});

// Index for better query performance
accountSchema.index({ userId: 1 });
// accountNumber has a unique field-level index; avoid duplicating here
accountSchema.index({ accountType: 1 });
accountSchema.index({ status: 1 });
accountSchema.index({ createdAt: -1 });

// Pre-save middleware to generate account number
accountSchema.pre('save', function(next) {
  if (this.isNew && !this.accountNumber) {
    this.accountNumber = this.generateAccountNumber();
  }
  next();
});

// Method to generate account number
accountSchema.methods.generateAccountNumber = function() {
  const prefix = this.accountType === 'primary' ? '1000' : '2000';
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${random}`;
};

// Method to check if account has sufficient balance
accountSchema.methods.hasSufficientBalance = function(amount) {
  return this.availableBalance >= amount;
};

// Method to update balance
accountSchema.methods.updateBalance = function(amount, type = 'credit') {
  if (type === 'credit') {
    this.balance += amount;
    this.availableBalance += amount;
  } else if (type === 'debit') {
    this.balance -= amount;
    this.availableBalance -= amount;
  }
  this.lastTransactionDate = new Date();
  return this.save();
};

// Method to hold funds (for pending transactions)
accountSchema.methods.holdFunds = function(amount) {
  if (this.availableBalance >= amount) {
    this.availableBalance -= amount;
    return this.save();
  }
  throw new Error('Insufficient available balance');
};

// Method to release held funds
accountSchema.methods.releaseFunds = function(amount) {
  this.availableBalance += amount;
  return this.save();
};

// Static method to find by user and type
accountSchema.statics.findByUserAndType = function(userId, accountType) {
  return this.find({ userId, accountType, status: 'active' });
};

// Static method to get user's primary account
accountSchema.statics.getPrimaryAccount = function(userId) {
  return this.findOne({ userId, isPrimary: true, status: 'active' });
};

module.exports = mongoose.model('Account', accountSchema);
