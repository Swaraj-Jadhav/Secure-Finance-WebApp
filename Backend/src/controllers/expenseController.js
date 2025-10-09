const Expense = require('../models/Expense');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class ExpenseController {
  // Get all user expenses
  async getExpenses(req, res) {
    try {
      const { page = 1, limit = 20, category, startDate, endDate } = req.query;

      const query = { userId: req.userId };
      if (category) query.category = category;
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const expenses = await Expense.find(query)
        .sort({ date: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Expense.countDocuments(query);

      res.json({
        success: true,
        data: {
          expenses,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      logger.error('Get expenses error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expenses',
        code: 'EXPENSES_FETCH_FAILED'
      });
    }
  }

  // Get single expense
  async getExpense(req, res) {
    try {
      const expense = await Expense.findOne({
        _id: req.params.id,
        userId: req.userId
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found',
          code: 'EXPENSE_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: { expense }
      });

    } catch (error) {
      logger.error('Get expense error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expense',
        code: 'EXPENSE_FETCH_FAILED'
      });
    }
  }

  // Create new expense
  async createExpense(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const expense = new Expense({
        ...req.body,
        userId: req.userId
      });

      await expense.save();

      logger.info(`Expense created: ${expense.description} for user ${req.userId}`);

      res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: { expense }
      });

    } catch (error) {
      logger.error('Create expense error:', error);
      res.status(500).json({
        success: false,
        message: 'Expense creation failed',
        code: 'EXPENSE_CREATION_FAILED'
      });
    }
  }

  // Update expense
  async updateExpense(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const expense = await Expense.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        req.body,
        { new: true, runValidators: true }
      );

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found',
          code: 'EXPENSE_NOT_FOUND'
        });
      }

      logger.info(`Expense updated: ${expense.description} for user ${req.userId}`);

      res.json({
        success: true,
        message: 'Expense updated successfully',
        data: { expense }
      });

    } catch (error) {
      logger.error('Update expense error:', error);
      res.status(500).json({
        success: false,
        message: 'Expense update failed',
        code: 'EXPENSE_UPDATE_FAILED'
      });
    }
  }

  // Delete expense
  async deleteExpense(req, res) {
    try {
      const expense = await Expense.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId
      });

      if (!expense) {
        return res.status(404).json({
          success: false,
          message: 'Expense not found',
          code: 'EXPENSE_NOT_FOUND'
        });
      }

      logger.info(`Expense deleted: ${expense.description} for user ${req.userId}`);

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      });

    } catch (error) {
      logger.error('Delete expense error:', error);
      res.status(500).json({
        success: false,
        message: 'Expense deletion failed',
        code: 'EXPENSE_DELETION_FAILED'
      });
    }
  }

  // Get expense analytics
  async getExpenseAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate ? new Date(endDate) : new Date();

      const analytics = await Expense.getExpensesByCategory(req.userId, start, end);

      res.json({
        success: true,
        data: { analytics }
      });

    } catch (error) {
      logger.error('Get expense analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch expense analytics',
        code: 'ANALYTICS_FETCH_FAILED'
      });
    }
  }
}

module.exports = new ExpenseController();
