const AppError = require("../utils/AppError");

const validate = (schema, target = 'body') => (req, _res, next) => {
  const data = req[target];
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });

  if (error) {
    return next(new AppError(`Validation error: ${error.details.map(x => x.message).join(', ')}`, 400));
  }

  req[target] = value;
  return next();
};

module.exports = validate;