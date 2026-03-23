const AppError = require("../utils/AppError");

const validate = (schema, target = 'body') => (req, _res, next) => {
  const data = req[target];
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });

  if (error) {
    return next(new AppError('Validation failed', 400, error.details));
  }

  req[target] = value;
  return next();
};

module.exports = validate;