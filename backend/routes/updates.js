const express = require('express');
const { body, param, query } = require('express-validator');

const { createUpdate, listUpdates } = require('../controllers/updates');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth);

router.post(
  '/fields/:id/updates',
  [
    param('id').isInt({ min: 1 }).withMessage('Field id must be a positive integer'),
    body('stage')
      .isIn(['Planted', 'Growing', 'Ready', 'Harvested'])
      .withMessage('Stage must be one of Planted, Growing, Ready, or Harvested'),
    body('notes')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Notes must be at least 10 characters long'),
    validate,
  ],
  createUpdate
);

router.get(
  '/fields/:id/updates',
  [
    param('id').isInt({ min: 1 }).withMessage('Field id must be a positive integer'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validate,
  ],
  listUpdates
);

module.exports = router;
