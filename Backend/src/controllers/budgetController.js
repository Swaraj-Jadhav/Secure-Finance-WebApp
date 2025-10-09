const Budget = require('../models/Budget');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

class BudgetController {
  // Get all user budgets
  async getBudgets(req, res) {
    try {
      const { page = 1, limit = 20, status, period } = req.query;

      const query = { userId: req.userId };
      if (status) query.status = status;
      if (period) query.period = period;

      const budgets = await Budget.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Budget.countDocuments(query);

      res.json({
        success: true,
        data: {
          budgets,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / limit),
            total
          }
        }
      });

    } catch (error) {
      logger.error('Get budgets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch budgets',
        code: 'BUDGETS_FETCH_FAILED'
      });
    }
  }

  // Get single budget
  async getBudget(req, res) {
    try {
      const budget = await Budget.findOne({
        _id: req.params.id,
        userId: req.userId
      });

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found',
          code: 'BUDGET_NOT_FOUND'
        });
      }

      res.json({
        success: true,
        data: { budget }
      });

    } catch (error) {
      logger.error('Get budget error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch budget',
        code: 'BUDGET_FETCH_FAILED'
      });
    }
  }

  // Create new budget
  async createBudget(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const budget = new Budget({
        ...req.body,
        userId: req.userId
      });

      await budget.save();

      logger.info(`Budget created: ${budget.name} for user ${req.userId}`);

      res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: { budget }
      });

    } catch (error) {
      logger.error('Create budget error:', error);
      res.status(500).json({
        success: false,
        message: 'Budget creation failed',
        code: 'BUDGET_CREATION_FAILED'
      });
    }
  }

  // Update budget
  async updateBudget(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const budget = await Budget.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        req.body,
        { new: true, runValidators: true }
      );

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found',
          code: 'BUDGET_NOT_FOUND'
        });
      }

      logger.info(`Budget updated: ${budget.name} for user ${req.userId}`);

      res.json({
        success: true,
        message: 'Budget updated successfully',
        data: { budget }
      });

    } catch (error) {
      logger.error('Update budget error:', error);
      res.status(500).json({
        success: false,
        message: 'Budget update failed',
        code: 'BUDGET_UPDATE_FAILED'
      });
    }
  }

  // Delete budget
  async deleteBudget(req, res) {
    try {
      const budget = await Budget.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId
      });

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: 'Budget not found',
          code: 'BUDGET_NOT_FOUND'
        });
      }

      logger.info(`Budget deleted: ${budget.name} for user ${req.userId}`);

      res.json({
        success: true,
        message: 'Budget deleted successfully'
      });

    } catch (error) {
      logger.error('Delete budget error:', error);
      res.status(500).json({
        success: false,
        message: 'Budget deletion failed',
        code: 'BUDGET_DELETION_FAILED'
      });
    }
  }

  // Get budget analytics
  async getBudgetAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate ? new Date(endDate) : new Date();

      const analytics = await Budget.getBudgetAnalytics(req.userId, start, end);

      res.json({
        success: true,
        data: { analytics: analytics[0] || {} }
      });

    } catch (error) {
      logger.error('Get budget analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch budget analytics',
        code: 'ANALYTICS_FETCH_FAILED'
      });
    }
  }
}

module.exports = new BudgetController();
