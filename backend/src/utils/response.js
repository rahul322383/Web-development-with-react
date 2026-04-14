const sendSuccess = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data,
  });
};

const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    status: 'error',
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
