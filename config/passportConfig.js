import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import { userModel } from "../models/userSchema.js";

export default function (passport) {

  // ============================
  // LOCAL STRATEGY
  // ============================
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username", // explicit
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          const user = await userModel.findOne({ username });

          if (!user) {
            return done(null, false, { message: "User not found" });
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Wrong password" });
          }

          return done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );

  // ============================
  // GOOGLE STRATEGY
  // ============================
  // passport.use(
  //   new GoogleStrategy(
  //     {
  //       clientID: process.env.GOOGLE_CLIENT_ID,
  //       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  //       callbackURL: "/google/callback", // Option B (no /auth)
  //     },
  //     async (accessToken, refreshToken, profile, done) => {
  //       try {
  //         let user = await userModel.findOne({ googleId: profile.id });

  //         if (!user) {
  //           user = await userModel.create({
  //             googleId: profile.id,
  //             name: profile.displayName,
  //             username: profile.emails[0].value,
  //             email: profile.emails[0].value,
  //           });
  //         }

  //         return done(null, user);
  //       } catch (err) {
  //         done(err);
  //       }
  //     }
  //   )
  // );

  // ============================
  // SERIALIZE / DESERIALIZE
  // ============================
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user);
  });
}
