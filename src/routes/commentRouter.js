const express = require("express");
const Comment = require("../models/CommentSchema");
const Profiles = require("../models/profileSchema");
const passport = require("passport")
const mongoose = require("mongoose")

const commentRouter = express.Router();

//Get Comments Based on post id

commentRouter.get("/:postId", async (req, res) => {
    try {
        const comment = await Comment.find({ post: req.params.postId }).exec(
            (err, comments) => {
                if (err) {
                    res.send(err);
                } else {
                    res.status(200).send({
                        total_comments: comments.length,
                        comments: comments
                    });
                }
            }
        );
    } catch (err) {
        res.status(500).send(err);
    }
});

//Post Comments
commentRouter.post("/:username/:postId",passport.authenticate("jwt"),async (req, res) => {
    try {
        if(req.user.username !== req.params.username){
            res.status(401).send("Sorry, you lack the authorization to make this comment")
        }

        await Profiles.findOne(
            { username: req.params.username},
            (err, username) => {
                if (username) {
                    const newComment = Comment.create(
                        {
                            username: req.params.username,
                            post: req.params.postId,
                            comment: req.body.comment
                        },
                        (err, resp) => {
                            if (err) {
                                res.send(err);
                            } else {
                                res.status(200).send({
                                    comment: resp
                                });
                            }
                        }
                    );
                } else {
                    res.send({ Message: "Username does not exist", err });
                }
            }
        );
    } catch (err) {
        res.status(500).send(err);
    }
});

//Get one Comment

commentRouter.get("/:postId/comment/:commentId", async (req, res) => {
    try {
        const comment = await Comment.findOne({
            post: req.params.postId,
            _id: req.params.commentId
        }).exec((err, comment) => {
            if (err) {
                res.send(err);
            } else {
                res.status(200).send({
                    comment: comment
                });
            }
        });
    } catch (err) {
        res.status(500).send(err);
    }
});

//Update Single Comment 

commentRouter.put("/:postId/:commentId", passport.authenticate("jwt"), async (req, res) => {
    try {
          const stringifiedID = new mongoose.Types.ObjectId(req.user._id)
         if (!stringifiedID.equals(req.user._id)){
         res.status(401).send("You do not have the authorization to edit this comment")
         }


        const updateComment = await Comment.updateOne(
            {
                _id: req.params.commentId,
                post: req.params.postId
            },
            { $set: { comment: req.body.comment } }
        );
        if (!updateComment) {
            res.status(404).send({ message: "Not found any to update" });
        } 

        res.send({ Message: "Updated", comment: req.body });

    } catch (err) {
        res.status(500).send(err);
    }
});

//Delete Comment

commentRouter.delete("/:postId/:commentId",passport.authenticate("jwt"), async (req, res) => {
    try {

        const stringifiedID = new mongoose.Types.ObjectId(req.user._id)
        if (!stringifiedID.equals(req.user._id)){
        return res.status(401).send("You do not have the authorization to delete this comment")
        }


        await Comment.remove(
            { post: req.params.postId, _id: req.params.commentId },
            function(err, comm) {
                if (err) {
                    res.send(err);
                } else {
                    res.send({ Message: "Deleted" });
                }
            }
        );
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = commentRouter;
