// routes/users.js
const express       = require('express');
const router        = express.Router();
const usersCtrl     = require('../controllers/usersController');
const { User }      = require('../models');
const { authorize } = require('../middleware/auth');

// POST /users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Email and password required.', details: {} } });
  try {
    const user = await User.findOne({ where: { email, password } });
    if (!user)
      return res.status(401).json({ success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Invalid email or password.', details: {} } });
    return res.json({ success: true, data: { userId: user.userId, email: user.email, userRole: user.userRole, firstName: user.firstName }, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: { code: 'DB_ERROR', message: err.message, details: {} } });
  }
});

// POST /users/register — public signup
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const errors = {};
  if (!firstName || !firstName.trim()) errors.firstName = 'First name is required.';
  if (!lastName  || !lastName.trim())  errors.lastName  = 'Last name is required.';
  if (!email     || !email.trim())     errors.email     = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email.';
  if (!password  || password.length < 6) errors.password = 'Password must be at least 6 characters.';
  if (Object.keys(errors).length)
    return res.status(400).json({ success: false, data: null, error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', details: errors } });
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ success: false, data: null, error: { code: 'CONFLICT', message: 'Email already in use.', details: {} } });
    const user = await User.create({ firstName, lastName, email, password, userRole: 'consumer' });
    return res.status(201).json({ success: true, data: { userId: user.userId, email: user.email, userRole: user.userRole, firstName: user.firstName }, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: { code: 'DB_ERROR', message: err.message, details: {} } });
  }
});

// PUT /users/me — update own profile (used by Settings page)
router.put('/me', async (req, res) => {
  const userRole = req.headers['x-user-role'];
  const userId   = req.headers['x-user-id'];
  if (!userId) return res.status(401).json({ success: false, data: null, error: { code: 'UNAUTHORIZED', message: 'Not logged in.', details: {} } });
  const { firstName, lastName, email } = req.body;
  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: 'User not found.', details: {} } });
    await user.update({ firstName, lastName, email });
    return res.json({ success: true, data: { userId: user.userId, email: user.email, firstName: user.firstName }, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: { code: 'DB_ERROR', message: err.message, details: {} } });
  }
});

router.get('/',       authorize('admin', 'employee'), usersCtrl.getAllUsers);
router.get('/:id',    authorize('admin', 'employee'), usersCtrl.getUserById);
router.post('/',      authorize('admin'),             usersCtrl.createUser);
router.put('/:id',    authorize('admin', 'employee'), usersCtrl.updateUser);
router.delete('/:id', authorize('admin'),             usersCtrl.deleteUser);

module.exports = router;
