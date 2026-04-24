const express = require('express');
const { body, param, query } = require('express-validator');

const {
  listFields,
  createField,
  getFieldById,
  updateField,
  deleteField,
  assignField,
} = require('../controllers/fields');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const router = express.Router();

const fieldIdValidation = param('id').isInt({ min: 1 }).withMessage('Field id must be a positive integer');

const fieldBodyValidation = [
  body('name').trim().notEmpty().withMessage('Field name is required'),
  body('crop').trim().notEmpty().withMessage('Crop is required'),
  body('planting_date').isISO8601().withMessage('Planting date must be a valid date'),
  body('expected_harvest_date')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Expected harvest date must be a valid date'),
  body('current_stage')
    .isIn(['Planted', 'Growing', 'Ready', 'Harvested'])
    .withMessage('Current stage must be one of Planted, Growing, Ready, or Harvested'),
];

router.use(requireAuth);

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('agent_id').optional().isInt({ min: 1 }).withMessage('Agent id must be a positive integer'),
    query('status').optional().isString(),
    query('stage').optional().isIn(['Planted', 'Growing', 'Ready', 'Harvested']),
    query('search').optional().isString(),
    validate,
  ],
  listFields
);

router.post('/', [...fieldBodyValidation, validate], requireRole('admin'), createField);

router.get('/:id', [fieldIdValidation, validate], getFieldById);

router.patch(
  '/:id',
  [
    fieldIdValidation,
    body('name').trim().notEmpty().withMessage('Field name is required'),
    body('crop').trim().notEmpty().withMessage('Crop is required'),
    body('planting_date').isISO8601().withMessage('Planting date must be a valid date'),
    body('expected_harvest_date')
      .optional({ nullable: true, checkFalsy: true })
      .isISO8601()
      .withMessage('Expected harvest date must be a valid date'),
    validate,
  ],
  requireRole('admin'),
  updateField
);

router.delete('/:id', [fieldIdValidation, validate], requireRole('admin'), deleteField);

router.post(
  '/:id/assign',
  [
    fieldIdValidation,
    body('agent_id').isInt({ min: 1 }).withMessage('Agent id must be a positive integer'),
    validate,
  ],
  requireRole('admin'),
  assignField
);

module.exports = router;
