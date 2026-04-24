const { validationResult } = require('express-validator');

function validate(req, _res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const error = new Error('Validation failed');
  error.statusCode = 422;
  error.code = 'VALIDATION_ERROR';
  error.details = result.array().map((issue) => ({
    field: issue.path,
    message: issue.msg,
  }));

  return next(error);
}

module.exports = {
  validate,
};
