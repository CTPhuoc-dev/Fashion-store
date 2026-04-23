const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const db = require("../models");

// Google OAuth Strategy
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await db.User.findOne({
        where: { googleId: profile.id }
      });

      if (user) {
        return done(null, user);
      }

      // Check if user exists by email
      user = await db.User.findOne({
        where: { email: profile.emails[0].value }
      });

      if (user) {
        // Update existing user with googleId
        await user.update({ googleId: profile.id });
        return done(null, user);
      }

      // Create new user
      const existingAdmin = await db.User.findOne({ where: { role: "admin" } });
      const userRole = existingAdmin ? "user" : "admin";

      const newUser = await db.User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        password: null, // No password for Google OAuth users
        role: userRole
      });

      return done(null, newUser);
    } catch (error) {
      return done(error, false);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});
