import express, { json } from 'express'
import {
  handleLogin,
  handleRegister,
  handleRegisterSubmit,
  handleLoginSubmit,
  handleProfileUpload,
  handleEditProfileSubmit,
  handleAcceptFollowRequest,
  handleRejectFollowRequest,
  handleFollowRequest
} from '../controllers/authController.js'
import { upload } from '../config/multerConfig.js'
import { userModel } from '../models/userSchema.js'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'

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
authRouter.get("/profile", isLoggedIn, async (req, res) => {
  const user = await userModel.findById(req.user._id)
    .populate("posts")
    .populate("pendingRequests"); // ⭐️ Important
  res.render("profile", { user });
});


// upload user profile picture
authRouter.post('/upload-profile', isLoggedIn, upload.single('profilePic'), handleProfileUpload)

authRouter.get('/edit-profile', isLoggedIn, (req, res) => {
  res.render("edit", { user: req.user })
})

authRouter.post("/edit-profile-submit", isLoggedIn, handleEditProfileSubmit);

authRouter.post("/follow-request/:id", isLoggedIn, handleFollowRequest)

authRouter.post('/accept-follow-request/:id', isLoggedIn, handleAcceptFollowRequest)

authRouter.post('/reject-follow-request/:id', isLoggedIn, handleRejectFollowRequest)

export { authRouter }
