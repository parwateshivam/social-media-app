import bcrypt from "bcryptjs";
import passport from "passport";
import { userModel } from "../models/userSchema.js";
import { io } from "../index.js";

// RENDER REGISTER PAGE
const handleRegister = (req, res) => {
  res.render("register.ejs");
};

// HANDLE REGISTER FORM SUBMIT
const handleRegisterSubmit = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    // CHECK DUPLICATE USER
    const userExist = await userModel.findOne({
      $or: [{ username }, { email }]
    });

    if (userExist) {
      return res.render("register.ejs", {
        error: `${userExist.email === email ? "Email already exist" : "Username already exist"}`
      });
    }

    // HASH PASSWORD
    const hash = await bcrypt.hash(password, 10);

    // CREATE USER
    await userModel.create({
      username,
      name,
      email,
      password: hash,
    });

    return res.redirect("/login");

  } catch (err) {
    console.error("Registration Error:", err);

    return res.render("register.ejs", {
      error: "Something went wrong. Please try again."
    });
  }
};

// RENDER LOGIN PAGE
const handleLogin = (req, res) => {
  res.render("login.ejs");
};

// HANDLE LOGIN SUBMIT
const handleLoginSubmit = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/feed",
    failureRedirect: "/login",
  })(req, res, next);
};

// handle profile upload
const handleProfileUpload = async (req, res) => {
  let user = await userModel.findByIdAndUpdate(req.user._id, { $set: { profilePic: req.file.filename } })
  res.redirect('/profile')
}

// HANDLE EDIT PROFILE SUBMIT
const handleEditProfileSubmit = async (req, res) => {
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
}

const handleFollowRequest = async (req, res) => {
  try {
    let targetedUserId = req.params.id.toString()
    let currentUserId = req.user._id.toString()

    if (targetedUserId === currentUserId) {
      return res.redirect('/feed')
    }

    const targetUser = await userModel.findById(targetedUserId)
    const currentUser = await userModel.findById(currentUserId)

    if (currentUser.sentRequests.includes(targetedUserId)) {
      currentUser.sentRequests.pull(targetedUserId)
      targetUser.pendingRequests.pull(currentUserId)
    } else {
      currentUser.sentRequests.push(targetedUserId)
      targetUser.pendingRequests.push(currentUserId)

      io.to(targetedUserId).emit("follow-request-notification", `${currentUser.username} has been requested to follow you`)
    }

    await currentUser.save()
    await targetUser.save()

    return res.redirect("/feed")
  } catch (err) {
    console.log(err)
    return res.redirect('/feed')
  }
}

const handleAcceptFollowRequest = async (req, res) => {
  try {
    const requestUserId = req.params.id;
    const currentUserId = req.user._id.toString();

    const requester = await userModel.findById(requestUserId);
    const currentUser = await userModel.findById(currentUserId);

    // Add followers/following
    currentUser.followers.push(requestUserId);
    requester.following.push(currentUserId);

    // Remove from pending + sent lists
    currentUser.pendingRequests.pull(requestUserId);
    requester.sentRequests.pull(currentUserId);

    await currentUser.save();
    await requester.save();

    return res.redirect("/profile");
  } catch (err) {
    console.log(err);
    return res.redirect("/profile");
  }
}

const handleRejectFollowRequest = async (req, res) => {
  try {
    const requestUserId = req.params.id;
    const currentUserId = req.user._id.toString();

    const requester = await userModel.findById(requestUserId);
    const currentUser = await userModel.findById(currentUserId);

    currentUser.pendingRequests.pull(requestUserId);
    requester.sentRequests.pull(currentUserId);

    await currentUser.save();
    await requester.save();

    return res.redirect("/profile");
  } catch (err) {
    console.log(err);
    return res.redirect("/profile");
  }
}

export {
  handleRegister,
  handleLogin,
  handleRegisterSubmit,
  handleLoginSubmit,
  handleProfileUpload,
  handleEditProfileSubmit,
  handleFollowRequest,
  handleAcceptFollowRequest,
  handleRejectFollowRequest
};
