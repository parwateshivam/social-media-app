import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  name: String,
  password: String,
  googleId: String,
  profilePic: String,
  bio: {
    type: String,
    trim: true
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts"
    }
  ],
  followeres: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    }
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    }
  ],
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

const userModel = mongoose.model("users", userSchema);

export { userModel };
