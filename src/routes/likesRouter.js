const express = require("express");
const Profiles = require("../models/profileSchema");
const Posts = require("../models/postSchema");
const path = require("path");
const fs = require("fs-extra");
const passport = require("passport");
const likeRouter = express.Router();

likeRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const likes = await Posts.findById(id);
    if (likes.reactions.length > 0) {
      const liketotal = await Posts.findById(id, { reactions: 1, _id: 0 });
      const likesCount = liketotal.reactions;
      console.log(likesCount.length);

      res.send({ LikesCount: likesCount.length, likes });
    } else {
      res.send("No reactions for this Post");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

likeRouter.post(
  "/addlike/:postID/:username",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      if (req.user.username !== req.params.username) {
        res
          .status(401)
          .send({ message: "You are not authorized for this reaction" });
      }

      const { postID } = req.params;
      const checkForID = await Posts.findById(postID);
      if (!checkForID) {
        res.status(404).send({ message: "No post for reaction" });
      } else {
        const userExists = await Posts.find(
          { "reactions.likedBy": req.params.username },
          { _id: 0, "reactions.$": 1 }
        );

        if (userExists) {
          const removeExistingUser = { likedBy: req.params.username };
          await Posts.findByIdAndUpdate(postID, {
            $pull: { reactions: removeExistingUser }
          });
        }

        const addTheUser = { likedBy: req.params.username };
        await Posts.findByIdAndUpdate(postID, {
          $push: { reactions: addTheUser }
        });
        res.send({ message: "added the like by user" });
      }
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }
  }
);

likeRouter.delete(
  "/deletelike/:postID/:username",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      if (req.user.username !== req.params.username) {
        res
          .status(401)
          .send({ message: "You are not authorized for this reaction" });
      } else {
        const { postID } = req.params;
        const checkForID = await Posts.findById(postID);

        if (!checkForID) {
          res.status(404).send({ error: "No post for reaction" });
        } else {
          const userToBeDeleted = await Posts.find(
            { "reactions.likedBy": req.params.username },
            { _id: 0, "reactions.$": 1 }
          );
          if (!userToBeDeleted) {
            console.log(!userToBeDeleted);
            res.status(404).send({
              error: "User never reacted to the Post"
            });
          } else {
            let body = { likedBy: req.params.username };
            await Posts.findByIdAndUpdate(postID, {
              $pull: { reactions: body }
            });
            res.status(200).send({ success: "deleted the like by user" });
          }
        }
      }
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }
  }
);

module.exports = likeRouter;
