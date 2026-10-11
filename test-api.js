const app = require('./server');

const PORT = 3001; // Separate port for tests
let server;

async function runTests() {
  server = app.listen(PORT);
  console.log(`Test server running on port ${PORT}\n--- Starting Route Tests ---`);

  const baseUrl = `http://localhost:${PORT}`;
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Root Route
  await test('GET / returns API route directory', async () => {
    const res = await fetch(`${baseUrl}/`, { headers: { Connection: 'close' } });
    const data = await res.json();
    if (res.status !== 200 || !data.endpoints) throw new Error(`Unexpected response: ${res.status}`);
  });

  // 2. Health Route
  await test('GET /api/health returns status OK', async () => {
    const res = await fetch(`${baseUrl}/api/health`, { headers: { Connection: 'close' } });
    const data = await res.json();
    if (res.status !== 200 || data.status !== 'OK') throw new Error(`Failed health check`);
  });

  // 3. Phone Validate
  await test('POST /api/phone/validate validates valid phone number', async () => {
    const res = await fetch(`${baseUrl}/api/phone/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Connection: 'close' },
      body: JSON.stringify({ phone: '+1234567890' })
    });
    const data = await res.json();
    if (!data.isValid) throw new Error(`Phone was not validated properly`);
  });

  // 4. Phone OTP Send & Verify flow
  await test('POST /api/phone/send-otp and POST /api/phone/verify-otp flow', async () => {
    const sendRes = await fetch(`${baseUrl}/api/phone/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Connection: 'close' },
      body: JSON.stringify({ phone: '+1987654321' })
    });
    const sendData = await sendRes.json();
    if (!sendData.testOtp) throw new Error(`Failed to generate test OTP`);

    const verifyRes = await fetch(`${baseUrl}/api/phone/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Connection: 'close' },
      body: JSON.stringify({ phone: '+1987654321', otp: sendData.testOtp })
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.verified) throw new Error(`OTP verification failed`);
  });

  // 5. Email Validate
  await test('POST /api/email/validate validates email correctly', async () => {
    const res = await fetch(`${baseUrl}/api/email/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Connection: 'close' },
      body: JSON.stringify({ email: 'tester@example.com' })
    });
    const data = await res.json();
    if (!data.isValid || data.domain !== 'example.com') throw new Error(`Email validation error`);
  });

  // 6. Email Send & Verify flow
  await test('POST /api/email/send-verification and GET /api/email/verify/:token', async () => {
    const sendRes = await fetch(`${baseUrl}/api/email/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Connection: 'close' },
      body: JSON.stringify({ email: 'user@domain.com' })
    });
    const sendData = await sendRes.json();
    const token = sendData.verificationToken;
    if (!token) throw new Error(`Verification token not returned`);

    const verifyRes = await fetch(`${baseUrl}/api/email/verify/${token}`, { headers: { Connection: 'close' } });
    const verifyData = await verifyRes.json();
    if (!verifyData.verified) throw new Error(`Email token verification failed`);
  });

  // 7. Users CRUD
  await test('GET /api/users & POST /api/users', async () => {
    const listRes = await fetch(`${baseUrl}/api/users`, { headers: { Connection: 'close' } });
    const listData = await listRes.json();
    if (listData.count < 3) throw new Error(`Expected at least 3 initial users`);

    const createRes = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Connection: 'close' },
      body: JSON.stringify({ name: 'David Test', email: 'david@test.com', phone: '+15551234567' })
    });
    if (createRes.status !== 201) throw new Error(`Failed to create user: status ${createRes.status}`);
  });

  // 8. Testing Echo
  await test('POST /api/test/echo echoes sent payload', async () => {
    const payload = { ping: 'pong', num: 42 };
    const res = await fetch(`${baseUrl}/api/test/echo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Connection: 'close' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.body.ping !== 'pong' || data.body.num !== 42) throw new Error(`Echo body mismatch`);
  });

  // 9. Status Code simulation
  await test('GET /api/test/status/418 returns HTTP 418', async () => {
    const res = await fetch(`${baseUrl}/api/test/status/418`, { headers: { Connection: 'close' } });
    if (res.status !== 418) throw new Error(`Expected status 418, got ${res.status}`);
  });

  // 10. 404 Route handling
  await test('GET /unknown-route returns 404 Not Found JSON', async () => {
    const res = await fetch(`${baseUrl}/unknown-route`, { headers: { Connection: 'close' } });
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });

  console.log(`\n--- Test Summary: ${passed} passed, ${failed} failed ---`);
  if (typeof server.closeAllConnections === 'function') {
    server.closeAllConnections();
  }
  server.close(() => {
    process.exitCode = failed > 0 ? 1 : 0;
  });
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  if (server) {
    if (typeof server.closeAllConnections === 'function') {
      server.closeAllConnections();
    }
    server.close(() => {
      process.exitCode = 1;
    });
  } else {
    process.exitCode = 1;
  }
});
