const jwt = require('jsonwebtoken');

const DEFAULT_EXPIRES_IN = '7d';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return secret;
}

function signToken(payload, options = {}) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: DEFAULT_EXPIRES_IN,
    ...options,
  });
}

function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = {
  DEFAULT_EXPIRES_IN,
  signToken,
  verifyToken,
};
