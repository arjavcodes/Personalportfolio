const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Helper to check DB connection
const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory fallback data based on Arjav's verified resume
const fallbackProjects = [
  {
    _id: '1',
    title: 'E-Commerce Platform with Razorpay',
    description: 'A 40-product e-commerce web platform across 6 categories with live search, filters, cart and checkout. Built 12 REST API endpoints using Node.js and Express with MySQL, and integrated Razorpay server-side payment verification.',
    techStack: ['Node.js', 'Express', 'MySQL', 'Razorpay', 'REST APIs', 'Postman'],
    githubUrl: 'https://github.com/arjavcodes',
    liveUrl: '',
    category: 'fullstack',
    featured: true,
    createdAt: new Date(),
  },
  {
    _id: '2',
    title: 'AI Chatbot for Elderly Care',
    description: 'An AI-powered companion and assistance chatbot featuring 3 reminder categories (daily tasks, medicines, birthdays) powered by Google Gemini API. Tested with seniors with accessibility optimizations and doctor guidance disclaimers.',
    techStack: ['JavaScript', 'Gemini API', 'HTML5', 'CSS3', 'UI Design'],
    githubUrl: 'https://github.com/arjavcodes',
    liveUrl: '',
    category: 'frontend',
    featured: true,
    createdAt: new Date(),
  },
  {
    _id: '3',
    title: 'Java & MySQL Expense Tracker',
    description: 'Robust financial management application with 6 expense categories and monthly spending summaries tested on 50 sample records. Features PreparedStatement SQL injection defense, DAO/service architecture, and 8 JUnit unit tests.',
    techStack: ['Java', 'JDBC', 'MySQL', 'JUnit', 'OOP'],
    githubUrl: 'https://github.com/arjavcodes',
    liveUrl: '',
    category: 'backend',
    featured: true,
    createdAt: new Date(),
  },
  {
    _id: '4',
    title: 'Responsive Gym & Fitness Website',
    description: 'A responsive fitness portal with 5 comprehensive sections (programs, plans, trainers, gallery, contact) across 3 breakpoints. Scored 95 in Performance and 92 in Accessibility on Google Lighthouse, deployed on Netlify.',
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'Netlify', 'Lighthouse'],
    githubUrl: 'https://github.com/arjavcodes',
    liveUrl: 'https://personalportfoliobyau.netlify.app',
    category: 'frontend',
    featured: false,
    createdAt: new Date(),
  },
];

// GET /api/projects
router.get('/', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({ success: true, data: fallbackProjects, source: 'fallback' });
    }
    const Project = require('../models/Project');
    const projects = await Project.find().sort({ featured: -1, createdAt: -1 });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
  try {
    if (!isDbConnected()) {
      const p = fallbackProjects.find(p => p._id === req.params.id);
      if (!p) return res.status(404).json({ success: false, message: 'Project not found' });
      return res.json({ success: true, data: p });
    }
    const Project = require('../models/Project');
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }
    const Project = require('../models/Project');
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }
    const Project = require('../models/Project');
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: 'Database not connected' });
    }
    const Project = require('../models/Project');
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
