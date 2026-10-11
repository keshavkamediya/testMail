const express = require('express');
const router = express.Router();

/**
 * POST /api/test/echo
 * Echoes request body, headers, and query parameters
 */
router.all('/echo', (req, res) => {
  res.json({
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/test/delay/:ms
 * Delays the response by specified milliseconds (e.g. for timeout testing)
 */
router.get('/delay/:ms', async (req, res) => {
  const ms = Math.min(Math.max(parseInt(req.params.ms, 10) || 1000, 0), 10000); // capped at 10s
  await new Promise(resolve => setTimeout(resolve, ms));
  res.json({
    success: true,
    delayedMs: ms,
    message: `Responded after ${ms}ms delay.`
  });
});

/**
 * GET /api/test/status/:code
 * Returns specific HTTP status code (e.g. 200, 400, 401, 403, 500, etc.)
 */
router.get('/status/:code', (req, res) => {
  const code = parseInt(req.params.code, 10) || 200;
  if (code < 100 || code > 599) {
    return res.status(400).json({ success: false, message: 'Invalid HTTP status code requested.' });
  }

  res.status(code).json({
    statusCode: code,
    message: `Returned response with HTTP ${code}`,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/test/simulate-error
 * Triggers uncaught exception to test error handling middleware
 */
router.get('/simulate-error', (req, res, next) => {
  const error = new Error('Simulated internal server error for middleware testing.');
  error.status = 500;
  next(error);
});

module.exports = router;
