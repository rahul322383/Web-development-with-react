const validate = (schema, target = 'body') => (req, res, next) => {
  const data = req[target];

  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map((x) => x.message)
    });
  }

  req[target] = value;
  next();
};

module.exports = validate;