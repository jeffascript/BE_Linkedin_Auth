const express = require("express");

const Posts = require("../models/postSchema");
const Profiles = require("../models/profileSchema");
const multer = require("multer");
const multerConfig = multer({});
const path = require("path");
const fs = require("fs-extra");

const postRouter = express.Router();

postRouter.get("/", async (req, res) => {
    const postsCount = await Posts.countDocuments();

    try {
        const posts = await Posts.find({});

        if (!posts || posts.length <= 0) {
          res.status(404).send({ message: "No posts found" });
        } else {
          res.send({ Total: postsCount, posts });
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

postRouter.get("/:id", async (req, res) => {
    try {
        const post = await Posts.findById(req.params.id);
        if (post) {
          res.send(post);
        } else {
          res.status(404).send({
            message: "Post was not found",
            req: req.params.id
          });
        }
         
    } catch (error) {
        res.status(500).send(error);
    }
});

postRouter.post("/:username", async (req, res) => {
    try {
        const { username } = req.params;

        const profile = await Profiles.findOne({ username });

        if (!profile) {
            return res.status(400).send({ Message: "Username not found" });
        }

        let newPost = await Posts.create(req.body);
        newPost.username = username;

        res.send({ success: "Post added", newPost });
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
});

//POST .../api/posts/{postId}
postRouter.post(
    "/:id/uploadImg",
    multerConfig.single("image"),
    async (req, res) => {
        try {
            const fileName =
               "post_" + req.params.id + path.extname(req.file.originalname);

            const newImageLocation = path.join(
                __dirname,
                "../../images/posts",
                fileName
            );

            await fs.writeFile(newImageLocation, req.file.buffer);

            req.body.image =
                req.protocol +
                "://" +
                req.get("host") +
                "/images/posts/" +
                fileName;

            const newPostImg = await Posts.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $set: { image: req.body.image }
                }
            );

            newPostImg.save();

            res.send("Image URL updated");
        } catch (ex) {
            res.status(500).send({ Message: "Internal server error", err: ex });
        }
    }
);

postRouter.put("/:id", async (req, res) => {
    try {
        const postToEdit = await Posts.findByIdAndUpdate(req.params.id, {
            $set: {
                ...req.body,
                updatedAt: new Date()
            }
        });

        if (postToEdit)
            res.status(200).send({ Message: "Updated!", post: req.body });

        res.status(404).send(`Post with id: ${req.params.id} is not found !`);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

postRouter.delete("/:id", async (req, res) => {
    try {
        const deletedPost = await Posts.findByIdAndDelete(req.params.id);

        if (deletedPost)
            res.status(200).send({ Message: "Successfully Deleted" });

        res.status(404).send({
            Message: `Post with id: ${req.params.id} not found for deletion!`
        });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = postRouter;
