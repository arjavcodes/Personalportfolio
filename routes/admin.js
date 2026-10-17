const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

const isDbConnected = () => mongoose.connection.readyState === 1;

// ─── Auth Middleware ────────────────────────────────────────
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user && req.user.isAuthorized) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Unauthorized. Admin access required.' });
}

// ─── Google OAuth Routes ────────────────────────────────────
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/admin/login?error=google_failed' }),
  (req, res) => {
    if (req.user && req.user.isAuthorized) {
      return res.redirect('/admin');
    }
    req.logout(() => {});
    return res.redirect('/admin/login?error=not_authorized');
  }
);

// ─── GitHub OAuth Routes ────────────────────────────────────
router.get('/auth/github', passport.authenticate('github', {
  scope: ['user:email'],
}));

router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/admin/login?error=github_failed' }),
  (req, res) => {
    if (req.user && req.user.isAuthorized) {
      return res.redirect('/admin');
    }
    req.logout(() => {});
    return res.redirect('/admin/login?error=not_authorized');
  }
);

// ─── Check Auth Status ──────────────────────────────────────
router.get('/me', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated() && req.user && req.user.isAuthorized) {
    return res.json({
      success: true,
      user: {
        displayName: req.user.displayName,
        email: req.user.email,
        avatar: req.user.avatar,
        provider: req.user.provider,
      },
    });
  }
  return res.status(401).json({ success: false, message: 'Not authenticated' });
});

// ─── Logout ─────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    req.session.destroy((err) => {
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out' });
    });
  });
});

// ─── Dashboard Stats ────────────────────────────────────────
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    let totalMessages = 0, unreadMessages = 0, totalProjects = 0;

    if (isDbConnected()) {
      const Contact = require('../models/Contact');
      const Project = require('../models/Project');
      totalMessages = await Contact.countDocuments();
      unreadMessages = await Contact.countDocuments({ read: false });
      totalProjects = await Project.countDocuments();
    }

    res.json({
      success: true,
      data: {
        totalMessages,
        unreadMessages,
        totalProjects,
        lastLogin: req.user.lastLogin,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Messages CRUD ──────────────────────────────────────────
router.get('/messages', isAuthenticated, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, data: [], source: 'no-db' });
    }
    const Contact = require('../models/Contact');
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/messages/:id/read', isAuthenticated, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: 'Database not connected' });
    const Contact = require('../models/Contact');
    const msg = await Contact.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/messages/:id', isAuthenticated, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: 'Database not connected' });
    const Contact = require('../models/Contact');
    const msg = await Contact.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Projects CRUD (Admin) ──────────────────────────────────
router.get('/projects', isAuthenticated, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, data: [], source: 'no-db' });
    }
    const Project = require('../models/Project');
    const projects = await Project.find().sort({ featured: -1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/projects', isAuthenticated, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: 'Database not connected' });
    const Project = require('../models/Project');
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/projects/:id', isAuthenticated, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: 'Database not connected' });
    const Project = require('../models/Project');
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/projects/:id', isAuthenticated, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: 'Database not connected' });
    const Project = require('../models/Project');
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Site Settings ──────────────────────────────────────────
router.get('/settings', isAuthenticated, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        data: {
          ownerName: 'Arjav Upadhyay',
          role: 'Software Engineer',
          bio: "I'm a Computer Science undergraduate (B.Tech CSE, 2024–2028) at JSS Academy of Technical Education, Noida with hands-on full-stack development experience.",
          email: 'aryay0108@gmail.com',
          location: 'Noida, Uttar Pradesh 🇮🇳',
          githubUrl: 'https://github.com/arjavcodes',
          linkedinUrl: 'https://linkedin.com/in/arjav-upadhyay-2b830a307',
          availability: 'Open for SDE / Full-Stack Internships',
          heroSubtitle: 'Building scalable backends, responsive web applications & AI integrations.',
        },
        source: 'default',
      });
    }
    const SiteSettings = require('../models/SiteSettings');
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/settings', isAuthenticated, async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: 'Database not connected' });
    const SiteSettings = require('../models/SiteSettings');
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
