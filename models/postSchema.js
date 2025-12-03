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
  ],
  comments: [
    {
      comment: String,
      doneBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
      },
      createdAt: Date
    }
  ]
})

const postModel = new mongoose.model("posts", postSchema)

export { postModel }