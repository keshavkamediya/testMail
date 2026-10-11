const express = require('express');
const router = express.Router();

let users = [
  { id: 1, name: 'Alice Smith', email: 'alice@example.com', phone: '+12025550143', verifiedEmail: true, verifiedPhone: true },
  { id: 2, name: 'Bob Johnson', email: 'bob@example.com', phone: '+12025550188', verifiedEmail: false, verifiedPhone: true },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', phone: '+12025550199', verifiedEmail: true, verifiedPhone: false }
];

/**
 * GET /api/users
 * Query params: ?email=... or ?phone=...
 */
router.get('/', (req, res) => {
  const { email, phone } = req.query;
  let results = users;

  if (email) {
    results = results.filter(u => u.email.toLowerCase().includes(email.toLowerCase()));
  }
  if (phone) {
    results = results.filter(u => u.phone.includes(phone));
  }

  res.json({
    count: results.length,
    users: results
  });
});

/**
 * GET /api/users/:id
 */
router.get('/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ success: false, message: `User with ID ${req.params.id} not found.` });
  }

  res.json({ success: true, user });
});

/**
 * POST /api/users
 * Body: { name, email, phone }
 */
router.post('/', (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Fields "name", "email", and "phone" are required.'
    });
  }

  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    email,
    phone,
    verifiedEmail: false,
    verifiedPhone: false
  };

  users.push(newUser);
  res.status(201).json({ success: true, message: 'User created successfully', user: newUser });
});

/**
 * DELETE /api/users/:id
 */
router.delete('/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const index = users.findIndex(u => u.id === userId);

  if (index === -1) {
    return res.status(404).json({ success: false, message: `User with ID ${req.params.id} not found.` });
  }

  const [deletedUser] = users.splice(index, 1);
  res.json({ success: true, message: 'User deleted successfully', deletedUser });
});

module.exports = router;
