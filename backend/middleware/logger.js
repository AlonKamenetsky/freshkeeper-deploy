// middleware/logger.js - Request logger middleware

function logger(req, res, next) {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Log request info
  console.log(`[${timestamp}] --> ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.query).length > 0) {
    console.log(`  Query Params: ${JSON.stringify(req.query)}`);
  }
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`  Request Body: ${JSON.stringify(req.body)}`);
  }

  // Override res.json to capture status + log response time
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] <-- ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | ${duration}ms`);
    return originalJson(data);
  };

  next();
}

module.exports = logger;
