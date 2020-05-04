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
    const postExists = await Posts.findById(id)
    if(postExists){

      let postInfo = await Posts.findById(id).populate({path: "reactions.likedBy", select: "imageUrl username firstname surname"});
      // postInfo = {ratedByThisUser:false,...postInfo }
      // let postInfo = { ...postInfos.$__.populated}
      // console.log(postInfo.reactions.find({ userID: "5ea55df64f424013b1d96a3a" }), "with ratings default")
      const likes = postExists
      if (likes.reactions.length > 0) {
        const liketotal = await Posts.findById(id, { reactions: 1, _id: 0 });
        const likesCount = liketotal.reactions;
        
        let youLike = false;
        if(req.query.userId){
           const { userId } = req.query
           console.log(userId, "req query")
           let posts = postExists.toObject()
        
          const upVotedByUser = posts.reactions.some( ({ userID }) => userID == userId)
          
          // console.log(upVotedByUser)

           upVotedByUser ? youLike = true : youLike

        }

        // console.log(likesCount.length);

        res.send({ isLikedByUser:youLike,  reactionsCount: likesCount.length, postInfo });
       
      } else {
        res.send({message: "No reactions yet"});
      }
    }
    else{
      res.status(404).send("This post does not exist");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

likeRouter.post(
  "/:postID/:username",
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
        const user = await Profiles.findOne({username: req.params.username})
     
        const userProfileID = user._id
        // console.log(userProfileID)
        const userExists = await Posts.find(
          { "reactions.likedBy": userProfileID }
          // ,{ _id: 0, "reactions.$": 1 }
        );

        if (userExists) {
          const removeExistingUser = { likedBy: userProfileID, userID: req.user._id };
          await Posts.findByIdAndUpdate(postID, {
            $pull: { reactions: removeExistingUser }
          });
        }

        const addTheUser = { likedBy: userProfileID, userID: req.user._id  };
        await Posts.findByIdAndUpdate(postID, {
          $push: { reactions: addTheUser }
        });
        res.send({ message: "added the like by user " + req.params.username + " with id: "  + userProfileID });
      }
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }
  }
);

likeRouter.delete(
  "/:postID/:username",
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
          const user = await Profiles.findOne({username: req.params.username})
     
          const userProfileID = user._id
          const userToBeDeleted = await Posts.find(
            { "reactions.likedBy": userProfileID , userID: req.user._id }
            // ,
            // { _id: 0, "reactions.$": 1 }
          );
          if (!userToBeDeleted) {
            console.log(!userToBeDeleted);
            res.status(404).send({
              error: "User never reacted to the Post"
            });
          } else {
            let body = { likedBy: userProfileID, userID: req.user._id  };
            await Posts.findByIdAndUpdate(postID, {
              $pull: { reactions: body }
            });
            res.status(200).send({ success: "deleted the like by user "+ userProfileID });
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
