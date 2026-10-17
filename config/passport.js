const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const mongoose = require('mongoose');

const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory session store for when DB is not connected
let memoryAdmins = {};

function configurePassport() {
  const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'aryay0108@gmail.com').toLowerCase();

  // ─── Serialize / Deserialize ─────────────────────────────
  passport.serializeUser((user, done) => {
    done(null, user.id || user._id || user.oauthId);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      if (isDbConnected()) {
        const Admin = require('../models/Admin');
        const user = await Admin.findById(id);
        return done(null, user);
      }
      // Fallback: memory store
      return done(null, memoryAdmins[id] || null);
    } catch (err) {
      done(err, null);
    }
  });

  // ─── Google OAuth Strategy ───────────────────────────────
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/admin/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = (profile.emails && profile.emails[0]?.value || '').toLowerCase();
            const isAuthorized = email === ADMIN_EMAIL;

            if (isDbConnected()) {
              const Admin = require('../models/Admin');
              let admin = await Admin.findOne({ oauthId: profile.id, provider: 'google' });
              if (admin) {
                admin.lastLogin = new Date();
                admin.isAuthorized = isAuthorized;
                admin.displayName = profile.displayName;
                admin.avatar = profile.photos?.[0]?.value || '';
                await admin.save();
              } else {
                admin = await Admin.create({
                  oauthId: profile.id,
                  provider: 'google',
                  email,
                  displayName: profile.displayName,
                  avatar: profile.photos?.[0]?.value || '',
                  isAuthorized,
                });
              }
              return done(null, admin);
            }

            // Fallback: memory
            const adminObj = {
              id: profile.id,
              _id: profile.id,
              oauthId: profile.id,
              provider: 'google',
              email,
              displayName: profile.displayName,
              avatar: profile.photos?.[0]?.value || '',
              isAuthorized,
              lastLogin: new Date(),
            };
            memoryAdmins[profile.id] = adminObj;
            return done(null, adminObj);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
  }

  // ─── GitHub OAuth Strategy ────────────────────────────────
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/admin/auth/github/callback',
          scope: ['user:email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = (profile.emails && profile.emails[0]?.value || '').toLowerCase();
            const isAuthorized = email === ADMIN_EMAIL;

            if (isDbConnected()) {
              const Admin = require('../models/Admin');
              let admin = await Admin.findOne({ oauthId: profile.id, provider: 'github' });
              if (admin) {
                admin.lastLogin = new Date();
                admin.isAuthorized = isAuthorized;
                admin.displayName = profile.displayName || profile.username;
                admin.avatar = profile.photos?.[0]?.value || '';
                if (email) admin.email = email;
                await admin.save();
              } else {
                admin = await Admin.create({
                  oauthId: profile.id,
                  provider: 'github',
                  email: email || `${profile.username}@github.com`,
                  displayName: profile.displayName || profile.username,
                  avatar: profile.photos?.[0]?.value || '',
                  isAuthorized,
                });
              }
              return done(null, admin);
            }

            // Fallback: memory
            const adminObj = {
              id: profile.id,
              _id: profile.id,
              oauthId: profile.id,
              provider: 'github',
              email: email || `${profile.username}@github.com`,
              displayName: profile.displayName || profile.username,
              avatar: profile.photos?.[0]?.value || '',
              isAuthorized,
              lastLogin: new Date(),
            };
            memoryAdmins[profile.id] = adminObj;
            return done(null, adminObj);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
  }
}

module.exports = { configurePassport };
