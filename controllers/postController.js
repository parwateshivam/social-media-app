import { postModel } from "../models/postSchema.js";
import { userModel } from "../models/userSchema.js";

const handlePostCreateSubmit = async (req, res) => {
  try {
    const { caption } = req.body;
    const imageFile = req.file ? req.file.filename : "";
    const userId = req.user._id;

    // Create post
    const newPost = await postModel.create({
      postPic: imageFile,
      caption: caption,
      createdBy: userId,
    });

    // Add post to user's posts array
    await userModel.findByIdAndUpdate(userId, {
      $push: { posts: newPost._id }
    });

    return res.redirect("/feed");

  } catch (err) {
    console.log("Error while creating post:", err);
    return res.status(500).send("Something went wrong");
  }
};

export { handlePostCreateSubmit };
