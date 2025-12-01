import express from 'express'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import { upload } from '../config/multerConfig.js'
import { handlePostCreateSubmit } from '../controllers/postController.js'
import { postModel } from '../models/postSchema.js'
import { userModel } from '../models/userSchema.js'

const postRouter = express.Router()

postRouter.get('/feed', isLoggedIn, async (req, res) => {
  try {
    const posts = await postModel.find().populate("createdBy").sort({ createdAt: -1 });
    const usersArray = await userModel.find()
    res.render("feed", { user: req.user, posts, usersArray });
  } catch (err) {
    console.log("Error loading feed:", err);
    res.status(500).send("Something went wrong");
  }
});

postRouter.get('/create-post', isLoggedIn, (req, res) => {
  res.render("post")
})

postRouter.post('/create-post-submit', isLoggedIn, upload.single("postImage"), handlePostCreateSubmit)

export { postRouter }