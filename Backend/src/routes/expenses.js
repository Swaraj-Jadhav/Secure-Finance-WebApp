const express = require('express');
const expenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/auth');
const {
  validateExpense,
  validateObjectId,
  validatePagination,
  validateDateRange
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Expense operations
router.get('/', validatePagination, validateDateRange, expenseController.getExpenses);
router.get('/analytics', validateDateRange, expenseController.getExpenseAnalytics);
router.get('/:id', validateObjectId('id'), expenseController.getExpense);
router.post('/', validateExpense, expenseController.createExpense);
router.put('/:id', validateObjectId('id'), validateExpense, expenseController.updateExpense);
router.delete('/:id', validateObjectId('id'), expenseController.deleteExpense);

module.exports = router;
