const express = require('express');
const budgetController = require('../controllers/budgetController');
const { authenticate } = require('../middleware/auth');
const {
  validateBudget,
  validateObjectId,
  validatePagination,
  validateDateRange
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Budget operations
router.get('/', validatePagination, budgetController.getBudgets);
router.get('/analytics', validateDateRange, budgetController.getBudgetAnalytics);
router.get('/:id', validateObjectId('id'), budgetController.getBudget);
router.post('/', validateBudget, budgetController.createBudget);
router.put('/:id', validateObjectId('id'), validateBudget, budgetController.updateBudget);
router.delete('/:id', validateObjectId('id'), budgetController.deleteBudget);

module.exports = router;
