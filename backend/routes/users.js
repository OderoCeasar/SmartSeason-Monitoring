const express = require('express');
const { query } = require('express-validator');

const { listUsers } = require('../controllers/users');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get(
  '/',
  [
    query('role').optional().isIn(['admin', 'field_agent']).withMessage('Role must be admin or field_agent'),
    query('search').optional().isString(),
    validate,
  ],
  listUsers
);

module.exports = router;
