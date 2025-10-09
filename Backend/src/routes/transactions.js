const express = require('express');
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const {
  validateTransaction,
  validateObjectId,
  validatePagination,
  validateDateRange
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Transaction operations
router.get('/', validatePagination, validateDateRange, transactionController.getTransactions);
router.get('/summary', validateDateRange, transactionController.getTransactionSummary);
router.get('/:id', validateObjectId('id'), transactionController.getTransaction);
router.post('/', validateTransaction, transactionController.createTransaction);

module.exports = router;
