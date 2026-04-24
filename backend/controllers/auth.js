const bcrypt = require('bcryptjs');

const { getDb } = require('../config/db');
const { signToken } = require('../config/jwt');
const { asyncHandler } = require('../utils/asyncHandler');

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const db = getDb();

  const user = await db('users')
    .select('id', 'name', 'email', 'role', 'password_hash')
    .whereRaw('LOWER(email) = ?', [String(email).toLowerCase()])
    .first();

  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const safeUser = sanitizeUser(user);
  const token = signToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });

  res.status(200).json({
    token,
    user: safeUser,
  });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    user: sanitizeUser(req.user),
  });
});

module.exports = {
  login,
  me,
};
