const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    required: true,
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  totalBudget: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  categories: [{
    category: {
      type: String,
      enum: [
        'groceries', 'utilities', 'transportation', 'entertainment', 'healthcare',
        'education', 'shopping', 'dining', 'travel', 'insurance', 'rent',
        'mortgage', 'loan', 'subscriptions', 'other'
      ],
      required: true
    },
    budgetedAmount: {
      type: Number,
      required: true,
      min: 0
    },
    spentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    color: {
      type: String,
      default: '#3B82F6'
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  alerts: {
    enabled: {
      type: Boolean,
      default: true
    },
    threshold: {
      type: Number,
      default: 80,
      min: 0,
      max: 100
    },
    notificationMethods: [{
      type: String,
      enum: ['email', 'sms', 'push'],
      default: 'email'
    }]
  },
  goals: [{
    name: String,
    targetAmount: Number,
    currentAmount: { type: Number, default: 0 },
    targetDate: Date,
    isCompleted: { type: Boolean, default: false }
  }],
  tags: [String],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringSettings: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly']
    },
    autoCreate: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total spent amount
budgetSchema.virtual('totalSpent').get(function() {
  return this.categories.reduce((total, category) => total + (category.spentAmount || 0), 0);
});

// Virtual for remaining budget
budgetSchema.virtual('remainingBudget').get(function() {
  return this.totalBudget - this.totalSpent;
});

// Virtual for budget utilization percentage
budgetSchema.virtual('utilizationPercentage').get(function() {
  return this.totalBudget > 0 ? (this.totalSpent / this.totalBudget) * 100 : 0;
});

// Virtual for budget status
budgetSchema.virtual('budgetStatus').get(function() {
  const percentage = this.utilizationPercentage;
  if (percentage >= 100) return 'over_budget';
  if (percentage >= this.alerts.threshold) return 'warning';
  return 'on_track';
});

// Index for better query performance
budgetSchema.index({ userId: 1, startDate: -1 });
budgetSchema.index({ status: 1 });
budgetSchema.index({ period: 1 });
budgetSchema.index({ isRecurring: 1 });

// Method to update spent amount for a category
budgetSchema.methods.updateSpentAmount = function(category, amount) {
  const categoryIndex = this.categories.findIndex(cat => cat.category === category);
  if (categoryIndex !== -1) {
    this.categories[categoryIndex].spentAmount += amount;
    return this.save();
  }
  throw new Error('Category not found in budget');
};

// Method to check if budget is over
budgetSchema.methods.isOverBudget = function() {
  return this.totalSpent > this.totalBudget;
};

// Method to get category utilization
budgetSchema.methods.getCategoryUtilization = function(category) {
  const categoryData = this.categories.find(cat => cat.category === category);
  if (!categoryData) return 0;
  
  return categoryData.budgetedAmount > 0 
    ? (categoryData.spentAmount / categoryData.budgetedAmount) * 100 
    : 0;
};

// Method to get budget summary
budgetSchema.methods.getSummary = function() {
  return {
    totalBudget: this.totalBudget,
    totalSpent: this.totalSpent,
    remainingBudget: this.remainingBudget,
    utilizationPercentage: this.utilizationPercentage,
    status: this.budgetStatus,
    categories: this.categories.map(cat => ({
      category: cat.category,
      budgetedAmount: cat.budgetedAmount,
      spentAmount: cat.spentAmount,
      remainingAmount: cat.budgetedAmount - cat.spentAmount,
      utilizationPercentage: this.getCategoryUtilization(cat.category)
    }))
  };
};

// Static method to get active budgets
budgetSchema.statics.getActiveBudgets = function(userId) {
  return this.find({
    userId,
    status: 'active',
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  }).sort({ startDate: -1 });
};

// Static method to get budget analytics
budgetSchema.statics.getBudgetAnalytics = function(userId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        startDate: { $gte: new Date(startDate) },
        endDate: { $lte: new Date(endDate) }
      }
    },
    {
      $group: {
        _id: null,
        totalBudgets: { $sum: 1 },
        totalBudgetedAmount: { $sum: '$totalBudget' },
        averageBudget: { $avg: '$totalBudget' },
        budgetsOverLimit: {
          $sum: {
            $cond: [
              { $gt: ['$totalSpent', '$totalBudget'] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Budget', budgetSchema);
