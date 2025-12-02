import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  postPic: {
    type: String,
    default: ""
  },
  caption: {
    type: String,
    default: ""
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    }
  ]
})

const postModel = new mongoose.model("posts", postSchema)

export { postModel }