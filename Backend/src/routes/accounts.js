const express = require('express');
const accountController = require('../controllers/accountController');
const { authenticate } = require('../middleware/auth');
const {
  validateAccountCreation,
  validateObjectId,
  validatePagination
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Account CRUD operations
router.get('/', validatePagination, accountController.getAccounts);
router.get('/:id', validateObjectId('id'), accountController.getAccount);
router.post('/', validateAccountCreation, accountController.createAccount);
router.put('/:id', validateObjectId('id'), accountController.updateAccount);
router.delete('/:id', validateObjectId('id'), accountController.deleteAccount);

// Account operations
router.post('/transfer', accountController.transferMoney);
router.get('/:id/transactions', validateObjectId('id'), validatePagination, accountController.getAccountTransactions);
router.get('/:id/summary', validateObjectId('id'), accountController.getAccountSummary);

module.exports = router;
