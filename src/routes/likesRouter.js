const express = require("express");
const Profiles = require("../models/profileSchema");
const Posts = require("../models/postSchema")


const path = require("path");
const fs = require("fs-extra");
const likeRouter = express.Router();



likeRouter.get("/:id", async (req, res) => {
    try {
        const{id}= req.params
        const likes = await Posts.findById(id);

        const liketotal = await Posts.findById(
            id,
            { reactions: 1, _id: 0 }
        );
        const likesCount = liketotal.reactions;
        console.log(likesCount.length);

        res.send({ LikesCount: likesCount.length, likes });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

likeRouter.post("/addlike/:postID/:user", async (req, res) => {
    try {
        const {postID} = req.params
        const checkForID = await Posts.findById(postID)
        if(!checkForID){
            res.status(404).send({error: "No post for reaction"})
        }

        let body = {likedBy: req.params.user}
        await Posts.findByIdAndUpdate(postID,{
            $push:{reactions: body}
        })

        res.status(200).send({success: "added the like by user"})

    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
});


likeRouter.delete("/deletelike/:postID/:user", async (req, res) => {
    try {
        const { postID } = req.params;
        const checkForID = await Posts.findById(postID);

        if (!checkForID) {
            res.status(404).send({ error: "No post for reaction" });
        } else {
            const userToBeDeleted = await Posts.find(
                { "reactions.likedBy": req.params.user },
                { _id: 0, "reactions.$": 1 }
            );
            if (!userToBeDeleted) {
                console.log(!userToBeDeleted);
                res.status(404).send({
                    error: "User never reacted to the Post"
                });
            } else {
                let body = { likedBy: req.params.user };
                await Posts.findByIdAndUpdate(postID, {
                    $pull: { reactions: body }
                });
                res.status(200).send({ success: "deleted the like by user" });
            }
        }
    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
});



/*

likeRouter.get("/like/:user/:postId", async (req, res) => {
    try {
        const profile = await Likes.findById(req.params.id);
        if (profile) {
            res.send(profile);
        } else {
            res.status(404).send("Cannot find the profile with the id");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

likeRouter.get("/username/:username", async (req, res) => {
    try {
        let username = { username: req.params.username };
        const profile = await Profiles.findOne(username);
        if (profile) {
            res.send(profile);
        } else {
            res.status(404).send("Cannot find the profile with the username");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//get all experiences for a profile.username
likeRouter.get("/:username/experiences", async (req, res) => {
    try {
        console.log(req.params.username);
        const profile = await Profiles.findOne(
            { username: req.params.username },
            { experience: 1, _id: 0 }
        );
        res.send(profile.experience);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//get one experience with ID
likeRouter.get("/experiences/:expId/", async (req, res) => {
    try {
        const experience = await Profiles.find(
            { "experience._id": req.params.expId },
            { _id: 0, "experience.$": 1 }
        );
        res.send(experience);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});




likeRouter.put("/:id", async (req, res) => {
    delete req.body._id;

    try {
        const profileForEdit = await Profiles.findByIdAndUpdate(req.params.id, {
            $set: {
                ...req.body,
                updatedAt: new Date()
            }
        });

        if (profileForEdit) {
            res.send("Updated!");
        } else {
            res.status(404).send(
                `profile with id: ${req.params.id} is not found !`
            );
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

likeRouter.delete("/:id", async (req, res) => {
    try {
        const deletedProfile = await Profiles.findByIdAndDelete(req.params.id);

        if (deletedProfile) res.status(200).send(" Successffully Deleted");
        else
            res.status(404).send(
                `profile with id: ${req.params.id} not found for deletion!`
            );
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

likeRouter.post("/experience/:username", async (req, res) => {
    // let newInfo = {...req.body,
    //     createdAt: new Date()}

    try {
        const newProject = req.body;
        const addProfileExperience = await Profiles.findOneAndUpdate(
            { username: req.params.username },
            {
                $push: { experience: newProject }
            }
        );
        console.log(addProfileExperience);
        res.send(addProfileExperience);
    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
});


*/
module.exports = likeRouter;
