const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema(
  {
    oauthId: {
      type: String,
      required: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ['google', 'github'],
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    isAuthorized: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', AdminSchema);
