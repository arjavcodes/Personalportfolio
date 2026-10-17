const mongoose = require('mongoose');

const SiteSettingsSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      default: 'Arjav Upadhyay',
      trim: true,
    },
    role: {
      type: String,
      default: 'Software Engineer',
      trim: true,
    },
    bio: {
      type: String,
      default: "I'm a Software Development Engineer with a passion for building robust, scalable applications across the full stack.",
      trim: true,
    },
    email: {
      type: String,
      default: 'aryay0108@gmail.com',
      trim: true,
    },
    location: {
      type: String,
      default: 'Noida, Uttar Pradesh 🇮🇳',
      trim: true,
    },
    githubUrl: {
      type: String,
      default: 'https://github.com/arjavcodes',
      trim: true,
    },
    linkedinUrl: {
      type: String,
      default: 'https://linkedin.com/in/arjav-upadhyay-2b830a307',
      trim: true,
    },
    availability: {
      type: String,
      default: 'Open for SDE / Full-Stack Internships',
      trim: true,
    },
    heroSubtitle: {
      type: String,
      default: 'Building scalable backends, responsive web applications & AI integrations.',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
