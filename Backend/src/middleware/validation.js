const { body, param, query } = require('express-validator');

// User registration validation
const validateRegistration = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('firstName')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        throw new Error('You must be at least 18 years old to register');
      }
      
      if (age > 120) {
        throw new Error('Please provide a valid date of birth');
      }
      
      return true;
    })
];

// User login validation
const validateLogin = [
  body('identifier')
    .notEmpty()
    .withMessage('Email or username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Password change validation
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
];

// Profile update validation
const validateProfileUpdate = [
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name can only contain letters and spaces'),
  
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name can only contain letters and spaces'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('address.street')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Street address must not exceed 100 characters'),
  
  body('address.city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('City must not exceed 50 characters'),
  
  body('address.state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('State must not exceed 50 characters'),
  
  body('address.zipCode')
    .optional()
    .isPostalCode('US')
    .withMessage('Please provide a valid ZIP code'),
  
  body('address.country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Country must not exceed 50 characters')
];

// Account creation validation
const validateAccountCreation = [
  body('accountName')
    .isLength({ min: 1, max: 100 })
    .withMessage('Account name must be between 1 and 100 characters'),
  
  body('accountType')
    .isIn(['primary', 'savings', 'checking', 'investment', 'virtual'])
    .withMessage('Invalid account type'),
  
  body('category')
    .isIn(['checking', 'savings', 'investment', 'travel', 'emergency', 'education', 'business', 'personal'])
    .withMessage('Invalid account category'),
  
  body('initialBalance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Initial balance must be a positive number'),
  
  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Currency must be a 3-letter code')
];

// Transaction validation
const validateTransaction = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  
  body('type')
    .isIn(['deposit', 'withdrawal', 'transfer', 'payment', 'income', 'expense', 'fee', 'refund'])
    .withMessage('Invalid transaction type'),
  
  body('category')
    .isIn([
      'groceries', 'utilities', 'transportation', 'entertainment', 'healthcare',
      'education', 'shopping', 'dining', 'travel', 'insurance', 'investment',
      'salary', 'bonus', 'freelance', 'rent', 'mortgage', 'loan', 'other'
    ])
    .withMessage('Invalid transaction category'),
  
  body('description')
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be between 1 and 200 characters'),
  
  body('fromAccount')
    .optional()
    .isMongoId()
    .withMessage('Invalid from account ID'),
  
  body('toAccount')
    .optional()
    .isMongoId()
    .withMessage('Invalid to account ID')
];

// Expense validation
const validateExpense = [
  body('category')
    .isIn([
      'groceries', 'utilities', 'transportation', 'entertainment', 'healthcare',
      'education', 'shopping', 'dining', 'travel', 'insurance', 'rent',
      'mortgage', 'loan', 'subscriptions', 'other'
    ])
    .withMessage('Invalid expense category'),
  
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number greater than 0'),
  
  body('description')
    .isLength({ min: 1, max: 200 })
    .withMessage('Description must be between 1 and 200 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'bank_transfer', 'digital_wallet', 'check', 'other'])
    .withMessage('Invalid payment method')
];

// Budget validation
const validateBudget = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Budget name must be between 1 and 100 characters'),
  
  body('period')
    .isIn(['weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('Invalid budget period'),
  
  body('totalBudget')
    .isFloat({ min: 0 })
    .withMessage('Total budget must be a positive number'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  
  body('endDate')
    .isISO8601()
    .withMessage('Please provide a valid end date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  body('categories')
    .isArray({ min: 1 })
    .withMessage('At least one category is required'),
  
  body('categories.*.category')
    .isIn([
      'groceries', 'utilities', 'transportation', 'entertainment', 'healthcare',
      'education', 'shopping', 'dining', 'travel', 'insurance', 'rent',
      'mortgage', 'loan', 'subscriptions', 'other'
    ])
    .withMessage('Invalid category in budget'),
  
  body('categories.*.budgetedAmount')
    .isFloat({ min: 0 })
    .withMessage('Budgeted amount must be a positive number')
];

// MongoDB ObjectId validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`)
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'amount', 'date', 'name'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Date range validation
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (value && req.query.startDate && new Date(value) <= new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

module.exports = {
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate,
  validateAccountCreation,
  validateTransaction,
  validateExpense,
  validateBudget,
  validateObjectId,
  validatePagination,
  validateDateRange
};
