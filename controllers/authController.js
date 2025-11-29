import bcrypt from "bcryptjs";
import passport from "passport";
import { userModel } from "../models/userSchema.js";

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
    successRedirect: "/profile",
    failureRedirect: "/login",
  })(req, res, next);
};

// handle profile upload

const handleProfileUpload = async (req, res) => {
  let user = await userModel.findByIdAndUpdate(req.user._id, { $set: { profilePic: req.file.filename } })
  res.redirect('/profile')
}

export {
  handleRegister,
  handleLogin,
  handleRegisterSubmit,
  handleLoginSubmit,
  handleProfileUpload
};
