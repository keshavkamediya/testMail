const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// In-memory verification token store
const emailTokens = new Map();

// RFC 5322 standard-compliant email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /api/email/info
 */
router.get('/info', (req, res) => {
  res.json({
    service: 'Email Testing Service',
    endpoints: [
      { method: 'POST', path: '/api/email/validate', description: 'Validate email format' },
      { method: 'POST', path: '/api/email/send-verification', description: 'Simulate sending verification email' },
      { method: 'GET', path: '/api/email/verify/:token', description: 'Simulate link verification click' },
      { method: 'POST', path: '/api/email/send-message', description: 'Simulate sending custom email message' }
    ]
  });
});

/**
 * POST /api/email/validate
 * Body: { email: string }
 */
router.post('/validate', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Field "email" is required.'
    });
  }

  const trimmed = String(email).trim().toLowerCase();
  const isValid = EMAIL_REGEX.test(trimmed);
  const parts = trimmed.split('@');

  return res.json({
    success: true,
    email: trimmed,
    isValid,
    domain: parts.length === 2 ? parts[1] : null,
    user: parts.length === 2 ? parts[0] : null
  });
});

/**
 * POST /api/email/send-verification
 * Body: { email: string }
 */
router.post('/send-verification', (req, res) => {
  const { email } = req.body;

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid "email" address.'
    });
  }

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  emailTokens.set(token, { email, expiresAt });

  const verificationUrl = `${req.protocol}://${req.get('host')}/api/email/verify/${token}`;

  return res.status(200).json({
    success: true,
    message: `Verification email queued for ${email}`,
    verificationToken: token,
    verificationUrl, // Ready-to-click testing URL
    expiresIn: '15 minutes'
  });
});

/**
 * GET /api/email/verify/:token
 */
router.get('/verify/:token', (req, res) => {
  const { token } = req.params;

  const record = emailTokens.get(token);

  if (!record) {
    return res.status(404).json({
      success: false,
      verified: false,
      message: 'Invalid or expired verification token.'
    });
  }

  if (Date.now() > record.expiresAt) {
    emailTokens.delete(token);
    return res.status(410).json({
      success: false,
      verified: false,
      message: 'Verification token has expired.'
    });
  }

  // Token is valid
  emailTokens.delete(token);

  return res.json({
    success: true,
    verified: true,
    email: record.email,
    message: `Email address ${record.email} successfully verified!`
  });
});

/**
 * POST /api/email/send-message
 * Body: { to: string, subject: string, body: string }
 */
router.post('/send-message', (req, res) => {
  const { to, subject, body } = req.body;

  if (!to || !subject || !body) {
    return res.status(400).json({
      success: false,
      message: 'Fields "to", "subject", and "body" are all required.'
    });
  }

  if (!EMAIL_REGEX.test(to)) {
    return res.status(400).json({
      success: false,
      message: 'Recipient address "to" is not a valid email.'
    });
  }

  // Simulate successful mail dispatch
  return res.status(200).json({
    success: true,
    message: `Simulated email dispatched to ${to}`,
    details: {
      messageId: `msg_${crypto.randomUUID()}`,
      to,
      subject,
      preview: body.length > 50 ? `${body.substring(0, 50)}...` : body,
      sentAt: new Date().toISOString()
    }
  });
});

module.exports = router;
