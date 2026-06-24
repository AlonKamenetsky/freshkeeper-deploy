// middleware/response.js - Standardized response helpers

function successResponse(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null
  });
}

function errorResponse(res, statusCode, code, message, details = {}) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: { code, message, details }
  });
}

module.exports = { successResponse, errorResponse };
