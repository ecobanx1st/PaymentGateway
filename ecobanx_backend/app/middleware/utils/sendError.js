const sendError = (reply, statusCode, message, result = null) => {
  return reply.code(statusCode).send({
    success: false,
    message,
    result,
  });
};

const sendSuccess = (reply, statusCode, message, result = null) => {
  return reply.code(statusCode).send({
    success: true,
    message,
    result,
  });
};

module.exports = { sendError, sendSuccess };
