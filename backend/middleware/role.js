function requireRole(...allowedRoles) {
  return function checkRole(req, _res, next) {
    if (!req.user) {
      const error = new Error('Authentication is required before checking roles');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      return next(error);
    }

    if (!allowedRoles.includes(req.user.role)) {
      const error = new Error('You do not have permission to perform this action');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      return next(error);
    }

    return next();
  };
}

module.exports = {
  requireRole,
};
