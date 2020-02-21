const express = require("express");
const Comment = require("../models/CommentSchema");
const Profiles = require("../models/profileSchema");
const passport = require("passport");
const mongoose = require("mongoose");

const commentRouter = express.Router();

//Get Comments Based on post id

commentRouter.get("/:postId", async (req, res) => {
  try {
    const comment = await Comment.find({ postId: req.params.postId }).exec(
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
commentRouter.post(
  "/:username/:postId",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      if (req.user.username !== req.params.username) {
        res
          .status(401)
          .send("Sorry, you lack the authorization to make this comment");
      } else {
        await Profiles.findOne(
          { username: req.params.username },
          (err, username) => {
            if (username) {
              const newComment = Comment.create(
                {
                  username: req.params.username,
                  postId: req.params.postId,
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
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

//Get one Comment

commentRouter.get("/:postId/comment/:commentId", async (req, res) => {
  try {
    const comment = await Comment.findOne({
      postId: req.params.postId,
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

commentRouter.put(
  "/:username/:postId/:commentId",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      if (req.user.username !== req.params.username) {
        res
          .status(401)
          .send("You do not have the authorization to edit this comment");
      } else {
        const updateComment = await Comment.updateOne(
          {
            _id: req.params.commentId,
            postId: req.params.postId
          },
          { $set: { comment: req.body.comment } }
        );
        if (!updateComment) {
          res.status(404).send({ message: "Not found any to update" });
        } else {
          res.send({ Message: "Updated", comment: req.body });
        }
      }
    } catch (err) {
      res.status(500).send(err);
    }
  }
);

//Delete Comment

commentRouter.delete(
  "/:username/:postId/:commentId",
  passport.authenticate("jwt"),
  async (req, res) => {
    try {
      if (req.user.username !== req.params.username) {
        res
          .status(401)
          .send("You do not have the authorization to delete this comment");
      } else {
        const forDelete = await Comment.findById(req.params.commentId);
        if (!forDelete) {
          res.status(404).send({ message: "Not found for deletion" });
        } else {
          await Comment.deleteOne(
            { postId: req.params.postId, _id: req.params.commentId },
            function(err, comm) {
              if (err) {
                res.send(err);
              } else {
                res.send({ Message: "Deleted" });
              }
            }
          );
        }
      }
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

module.exports = commentRouter;
