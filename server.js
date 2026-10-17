require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const { configurePassport } = require('./config/passport');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Session Configuration ────────────────────────────────────────────────────
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'portfolio-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
  },
};

// Use MongoDB session store if connected
if (process.env.MONGO_URI) {
  const MongoStore = require('connect-mongo');
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    touchAfter: 24 * 3600,
    collectionName: 'sessions',
  });
}

app.use(session(sessionConfig));

// ─── Passport ─────────────────────────────────────────────────────────────────
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// ─── Serve Static Frontend ────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/projects', require('./routes/projects'));
app.use('/api/contact',  require('./routes/contact'));
app.use('/api/admin',    require('./routes/admin'));

// ─── Serve admin pages ───────────────────────────────────────────────────────
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/admin', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user && req.user.isAuthorized) {
    return res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  }
  return res.redirect('/admin/login');
});

// ─── Serve index.html for all non-API routes ──────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// ─── Database + Server Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn('⚠️  No MONGO_URI set in .env — running in mock/demo mode.');
  app.listen(PORT, () => {
    console.log(`🚀 Portfolio server running at http://localhost:${PORT}`);
    console.log('📝 Set MONGO_URI in .env to enable full database features.');
  });
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB connected');
      app.listen(PORT, () => {
        console.log(`🚀 Portfolio server running at http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      // Still start server even if DB fails (will serve static + 503 on DB routes)
      app.listen(PORT, () => {
        console.log(`⚠️  Server started WITHOUT DB at http://localhost:${PORT}`);
      });
    });
}

module.exports = app;
