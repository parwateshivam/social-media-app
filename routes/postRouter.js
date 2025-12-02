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

postRouter.post('/like/:id', isLoggedIn, async (req, res) => {
  try {
    let post = await postModel.findOne({ _id: req.params.id });

    // If post not found
    if (!post) return res.redirect('/feed');

    // Convert userId to string for comparison
    const userId = req.user._id.toString();

    // Check if already liked
    if (post.likes.includes(userId)) {
      console.log("Already liked → Removing like");
      post.likes.pull(userId);   // remove like
    } else {
      console.log("Not liked yet → Adding like");
      post.likes.push(userId);   // add like
    }

    await post.save();

    return res.redirect('/feed');

  } catch (err) {
    console.log(err);
    return res.redirect('/feed');
  }
});

postRouter.post('/follow/:id', isLoggedIn, async (req, res) => {
  try {
    console.log(req.params.id)
    res.redirect('/feed')
  } catch (err) {
    console.log(err)
  }
})

export { postRouter }