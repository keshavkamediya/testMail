const express = require('express');
const router = express.Router();

// In-memory store for OTP testing
const otpStore = new Map();

// Helper regex for basic E.164 phone validation or standard 10-digit
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * GET /api/phone/info
 * Returns phone router test documentation
 */
router.get('/info', (req, res) => {
  res.json({
    service: 'Phone Testing Service',
    endpoints: [
      { method: 'POST', path: '/api/phone/validate', description: 'Validate phone number format' },
      { method: 'POST', path: '/api/phone/send-otp', description: 'Simulate sending an OTP code' },
      { method: 'POST', path: '/api/phone/verify-otp', description: 'Verify sent OTP code' },
      { method: 'GET', path: '/api/phone/active-otps', description: 'Inspect active OTPs (for testing only)' }
    ]
  });
});

/**
 * POST /api/phone/validate
 * Body: { phone: string }
 */
router.post('/validate', (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Field "phone" is required in request body.'
    });
  }

  const cleaned = String(phone).replace(/[\s\-()]/g, '');
  const isValid = PHONE_REGEX.test(cleaned);

  return res.json({
    success: true,
    input: phone,
    cleanedPhone: cleaned,
    isValid,
    format: isValid ? 'Valid international/E.164 phone number' : 'Invalid phone number format'
  });
});

/**
 * POST /api/phone/send-otp
 * Body: { phone: string }
 */
router.post('/send-otp', (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Field "phone" is required.'
    });
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(phone, { otp, expiresAt });

  return res.status(200).json({
    success: true,
    message: `OTP sent successfully to ${phone}`,
    testOtp: otp, // Returned for testing convenience
    expiresIn: '5 minutes'
  });
});

/**
 * POST /api/phone/verify-otp
 * Body: { phone: string, otp: string }
 */
router.post('/verify-otp', (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Both "phone" and "otp" are required.'
    });
  }

  const record = otpStore.get(phone);

  if (!record) {
    return res.status(404).json({
      success: false,
      verified: false,
      message: 'No OTP found for this phone number. Please request a new OTP.'
    });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return res.status(410).json({
      success: false,
      verified: false,
      message: 'OTP has expired.'
    });
  }

  if (record.otp !== String(otp).trim()) {
    return res.status(400).json({
      success: false,
      verified: false,
      message: 'Invalid OTP entered.'
    });
  }

  // Consume OTP on successful verification
  otpStore.delete(phone);

  return res.json({
    success: true,
    verified: true,
    message: `Phone number ${phone} verified successfully!`
  });
});

/**
 * GET /api/phone/active-otps
 * Helpful for inspection during automated / manual testing
 */
router.get('/active-otps', (req, res) => {
  const active = [];
  const now = Date.now();
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt > now) {
      active.push({ phone, otp: data.otp, remainingMs: data.expiresAt - now });
    }
  }
  res.json({ count: active.length, activeOTPs: active });
});

module.exports = router;
