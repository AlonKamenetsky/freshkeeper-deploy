// server.js — FreshKeeper Final Deployment
require('dotenv').config();

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const app        = express();
const server     = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
const PORT         = process.env.PORT || 3000;

// ── Socket.IO ──────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: FRONTEND_URL, methods: ['GET', 'POST'] },
});
app.set('io', io);

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`[WS] connected: ${socket.id}`);

  socket.on('user_join', ({ userId, email, role }) => {
    onlineUsers.set(socket.id, { userId, email, role });
    io.emit('online_users', Array.from(onlineUsers.values()));
  });

  socket.on('subscribe_expiry', () => {
    socket.join('expiry_room');
    socket.emit('subscribed', { room: 'expiry_room' });
  });

  socket.on('pantry_message', ({ text, from }) => {
    const ts = new Date().toISOString();
    io.emit('pantry_message', { text, from: from || 'Anonymous', ts });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.emit('online_users', Array.from(onlineUsers.values()));
  });
});

// ── CORS ───────────────────────────────────────────────────
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  FRONTEND_URL);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-user-role, x-user-id');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Middleware ─────────────────────────────────────────────
const logger = require('./middleware/logger');
app.use(express.json());
app.use(logger);

// ── Routes ─────────────────────────────────────────────────
app.use('/users',   require('./routes/users'));
app.use('/items',   require('./routes/items'));
app.use('/recipes', require('./routes/recipes'));
app.use('/ai',      require('./routes/ai'));

// ── Health check ───────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ success: true, data: { message: 'FreshKeeper API', port: PORT }, error: null });
});

// ── 404 ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, data: null, error: { code: 'NOT_FOUND', message: `${req.method} ${req.originalUrl} not found.`, details: {} } });
});

// ── Global error ───────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ success: false, data: null, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.', details: {} } });
});

// ── DB sync + start ────────────────────────────────────────
const { sequelize } = require('./models');

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: true });
    console.log('✅ ORM models synced');
    server.listen(PORT, () => {
      console.log(`🚀 FreshKeeper running on port ${PORT}`);
      console.log(`🔌 Socket.IO ready`);
    });
  } catch (err) {
    console.error('❌ Startup failed:', err.message);
    process.exit(1);
  }
}

start();
