const { verifyToken } = require('../config/jwt');
const { getDb } = require('../config/db');

function extractBearerToken(headerValue) {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = headerValue.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

async function requireAuth(req, _res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      const error = new Error('Authentication token is required');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    const payload = verifyToken(token);
    const db = getDb();

    const user = await db('users')
      .select('id', 'name', 'email', 'role')
      .where({ id: payload.sub })
      .first();

    if (!user) {
      const error = new Error('Authenticated user was not found');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      error.message = 'Invalid or expired authentication token';
    }

    next(error);
  }
}

module.exports = {
  requireAuth,
};
