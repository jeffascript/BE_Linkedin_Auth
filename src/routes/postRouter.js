const express = require("express");
const passport = require("passport")
const Posts = require("../models/postSchema");
const Profiles = require("../models/profileSchema");
const multer = require("multer");
const multerConfig = multer({});
const path = require("path");
const fs = require("fs-extra");
// const mongoose = require("mongoose")
const { uploadMulterToCloudinary, breakpoints, cloudConfig } = require("../middleware/cloudImageUploader")
const cloudinary = require('cloudinary').v2

const postRouter = express.Router();

postRouter.get("/", async (req, res) => {
    const postsCount = await Posts.countDocuments();

    try {
        const posts = await Posts.find({}).populate({path:"userInfo", model:"profiles"});

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

postRouter.post("/:username", passport.authenticate("jwt"), async (req, res) => {
    try {
        const { username } = req.params;
        const profile = await Profiles.findOne({ username });

        if (!profile) {
            return res.status(400).send({ Message: "Username not found" });
        }

        if(req.user.username !== username){
            res.status(401).send({ Message: "Not authorized to post" });
        }

        else{
            let reqUser = {...req.body, username, userInfo:profile._id}
            
            let newPost = await Posts.create(reqUser)
            newPost = await newPost.populate('userInfo').execPopulate();
           
        res.send(newPost)
        }
    } catch (error) {
        console.log(error)
        res.status(500).send(error);
    }
});

//POST .../api/posts/{postId}
postRouter.post(
    "/:username/:id/uploadImg",
    uploadMulterToCloudinary.single("post"), passport.authenticate("jwt"),
    async (req, res) => {
        try {

            if(req.user.username !== req.params.username){
                res.status(401).send({ Message: "Not authorized to post" });
            }


            // const fileName =
            //    "post_" + req.params.id + path.extname(req.file.originalname);

            // const newImageLocation = path.join(
            //     __dirname, "../../images/posts", fileName
            // );

            // await fs.writeFile(newImageLocation, req.file.buffer);

            // req.body.image = req.protocol + "://" + req.get("host") + "/images/posts/" + fileName;

            cloudConfig
            const newImage =   await cloudinary.uploader.upload(req.file.path,breakpoints)
            let newimageUrl = `${newImage.secure_url}`


            const newPostImg = await Posts.findOneAndUpdate(
                { _id: req.params.id },
                {
                    $set: { image: newimageUrl}
                },
                {
                    new: true
                   
                }).populate({path:"userInfo", model:"profiles"});

            // newPostImg.save();
                console.log(newPostImg,"image uploaded")
            res.send(newPostImg);
        } catch (ex) {
            res.status(500).send({ Message: "Internal server error", err: ex });
        }
    }
);

postRouter.put("/:username/:id",passport.authenticate("jwt"), async (req, res) => {
    try {
       
        if(req.user.username !== req.params.username){
            res.status(401).send("You do not have the authorization to edit this post")
        }
else{


        const postToEdit = await Posts.findByIdAndUpdate(req.params.id, {
            $set: {
                ...req.body,
                updatedAt: new Date()
                
            }
        }, {
            new:true
        })
        // .populate("userInfo");
         .populate({path:"userInfo", model:"profiles"});

        if (!postToEdit){
            res.status(404).send(`Post with id: ${req.params.id} is not found !`);
        }
        else{
            res.send(postToEdit);
        }
    }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

postRouter.delete("/:username/:id",passport.authenticate("jwt"), async (req, res) => {
    try {
       
        if(req.user.username !== req.params.username){
            res.status(401).send("You do not have the authorization to delete this post")
        }

        else{

        
        const deletedPost = await Posts.findByIdAndDelete(req.params.id);

        if (!deletedPost){
            res.status(404).send({
                Message: `Post with id: ${req.params.id} not found for deletion!`
            });
        }
            else{
                res.status(200).send({ Message: "Successfully Deleted" });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = postRouter;
