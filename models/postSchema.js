import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  postPic: {
    type: String,
    default: ""
  },
  createdBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const postModel = new mongoose.model("posts", postSchema)

export { postModel }