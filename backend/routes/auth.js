const express = require('express');
const { body } = require('express-validator');

const { login, me } = require('../controllers/auth');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').trim().isEmail().withMessage('A valid email address is required'),
    body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    validate,
  ],
  login
);

router.post('/me', requireAuth, me);

module.exports = router;
