import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  name: String,
  password: String,
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
  followers: [
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
  pendingRequests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    }
  ],
  sentRequests: [
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
