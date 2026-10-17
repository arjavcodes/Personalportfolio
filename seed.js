require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');

const projects = [
  {
    title: 'E-Commerce Platform with Razorpay',
    description: 'A 40-product e-commerce web platform across 6 categories with live search, filters, cart and checkout. Built 12 REST API endpoints using Node.js and Express with MySQL, and integrated Razorpay server-side payment verification.',
    techStack: ['Node.js', 'Express', 'MySQL', 'Razorpay', 'REST APIs', 'Postman'],
    githubUrl: 'https://github.com/arjavcodes',
    liveUrl: '',
    category: 'fullstack',
    featured: true,
  },
  {
    title: 'AI Chatbot for Elderly Care',
    description: 'An AI-powered companion and assistance chatbot featuring 3 reminder categories (daily tasks, medicines, birthdays) powered by Google Gemini API. Tested with seniors with accessibility optimizations and doctor guidance disclaimers.',
    techStack: ['JavaScript', 'Gemini API', 'HTML5', 'CSS3', 'UI Design'],
    githubUrl: 'https://github.com/arjavcodes',
    liveUrl: '',
    category: 'frontend',
    featured: true,
  },
  {
    title: 'Java & MySQL Expense Tracker',
    description: 'Robust financial management application with 6 expense categories and monthly spending summaries tested on 50 sample records. Features PreparedStatement SQL injection defense, DAO/service architecture, and 8 JUnit unit tests.',
    techStack: ['Java', 'JDBC', 'MySQL', 'JUnit', 'OOP'],
    githubUrl: 'https://github.com/arjavcodes',
    liveUrl: '',
    category: 'backend',
    featured: true,
  },
  {
    title: 'Responsive Gym & Fitness Website',
    description: 'A responsive fitness portal with 5 comprehensive sections (programs, plans, trainers, gallery, contact) across 3 breakpoints. Scored 95 in Performance and 92 in Accessibility on Google Lighthouse, deployed on Netlify.',
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'Netlify', 'Lighthouse'],
    githubUrl: 'https://github.com/arjavcodes',
    liveUrl: 'https://personalportfoliobyau.netlify.app',
    category: 'frontend',
    featured: false,
  },
];

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI not set in .env file');
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Project.deleteMany({});
    console.log('🗑️  Cleared existing projects');

    const inserted = await Project.insertMany(projects);
    console.log(`✅ Seeded ${inserted.length} projects successfully!`);

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
