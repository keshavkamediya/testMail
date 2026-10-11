const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const phoneRoutes = require('./routes/phone');
const emailRoutes = require('./routes/email');
const userRoutes = require('./routes/users');
const testRoutes = require('./routes/testing');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route - Overview of available test endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Phone & Mail Express Testing API',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      phone: {
        info: 'GET /api/phone/info',
        validate: 'POST /api/phone/validate',
        sendOtp: 'POST /api/phone/send-otp',
        verifyOtp: 'POST /api/phone/verify-otp',
        activeOtps: 'GET /api/phone/active-otps'
      },
      email: {
        info: 'GET /api/email/info',
        validate: 'POST /api/email/validate',
        sendVerification: 'POST /api/email/send-verification',
        verifyToken: 'GET /api/email/verify/:token',
        sendMessage: 'POST /api/email/send-message'
      },
      users: {
        list: 'GET /api/users',
        getById: 'GET /api/users/:id',
        create: 'POST /api/users',
        delete: 'DELETE /api/users/:id'
      },
      testingUtilities: {
        echo: 'ALL /api/test/echo',
        delay: 'GET /api/test/delay/:ms',
        status: 'GET /api/test/status/:code',
        simulateError: 'GET /api/test/simulate-error'
      }
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: `${process.uptime().toFixed(2)}s`,
    timestamp: new Date().toISOString()
  });
});

// Mount modular route handlers
app.use('/api/phone', phoneRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/users', userRoutes);
app.use('/api/test', testRoutes);

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route Not Found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
    status
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
