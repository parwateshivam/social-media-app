import express from 'express'
import { isLoggedIn } from '../middlewares/isLoggedIn.js'
import { upload } from '../config/multerConfig.js'
import { handlePostCreateSubmit } from '../controllers/postController.js'
import { postModel } from '../models/postSchema.js'
import { userModel } from '../models/userSchema.js'
import { io } from '../index.js'

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

postRouter.post('/delete-post/:postId', isLoggedIn, async (req, res) => {
  try {
    await postModel.findByIdAndDelete(req.params.postId);
    await userModel.findByIdAndUpdate(
      req.user._id,
      { $pull: { posts: req.params.postId } }
    )
    res.redirect('/profile');
  } catch (err) {
    console.log(err);
    res.redirect('/profile');
  }
});

postRouter.post('/like/:id', isLoggedIn, async (req, res) => {
  try {
    let post = await postModel
      .findOne({ _id: req.params.id })
      .populate("createdBy");

    if (!post) return res.redirect('/feed');

    const userId = req.user._id.toString();
    const postOwnerId = post.createdBy._id.toString();

    if (post.likes.includes(userId)) {
      console.log("Already liked → Removing like");
      post.likes.pull(userId);
    } else {
      console.log("Not liked yet → Adding like");
      post.likes.push(userId);
    }

    await post.save();

    // Send real-time notification only to post owner
    if (postOwnerId !== userId) {
      io.to(postOwnerId).emit("like-notification",
        `${req.user.username} likes your post`
      );
    }

    return res.redirect('/feed');

  } catch (err) {
    console.log(err);
    return res.redirect('/feed');
  }
});


postRouter.get('/comment/:id', isLoggedIn, (req, res) => {
  let postId = req.params.id
  res.render("comment", { postId })
})

postRouter.post('/comment-submit/:postId', isLoggedIn, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;
    const { comment } = req.body;

    let post = await postModel.findById(postId)
    let postOwnerId = post.createdBy.toString()

    await postModel.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            comment: comment,
            doneBy: userId,
            createdAt: new Date()
          }
        }
      }
    );

    io.to(postOwnerId).emit('comment-notification', `${req.user.username} has comments on your post`)

    res.redirect('/feed');
  } catch (err) {
    console.log(err);
    res.redirect('/feed');
  }
});

export { postRouter }