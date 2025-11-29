import express from 'express'
import {
  handleLogin,
  handleRegister,
  handleRegisterSubmit,
  handleLoginSubmit,
  handleProfileUpload
} from '../controllers/authController.js'
import { upload } from '../config/multerConfig.js'
import { userModel } from '../models/userSchema.js'

const authRouter = express.Router()

// REGISTER
authRouter.get('/register', handleRegister)
authRouter.post('/register-submit', handleRegisterSubmit)

// LOGIN
authRouter.get('/login', handleLogin)
authRouter.post('/login-submit', handleLoginSubmit)

// LOGOUT
authRouter.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

// PROTECTED ROUTE INSIDE THIS FILE OR OUTSIDE
authRouter.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile.ejs", { user: req.user });
});

// Middleware to protect routes
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// upload user profile picture

authRouter.post('/upload-profile', isLoggedIn, upload.single('profilePic'), handleProfileUpload)

authRouter.get('/edit-profile', isLoggedIn, (req, res) => {
  res.render("edit", { user: req.user })
})

authRouter.post("/edit-profile-submit", isLoggedIn, async (req, res) => {
  try {
    const { username, bio } = req.body;

    // Check if username is taken by someone else
    const existingUser = await userModel.findOne({ username });

    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      return res.status(400).render("edit", { user: req.user, error: "Username already exists" });
    }

    let updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      { username, bio },
      { new: true }
    );

    await updatedUser.save()

    res.redirect('/profile')

  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  }
});

export { authRouter }
