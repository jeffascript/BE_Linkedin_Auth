const mongoose = require("mongoose");

const schema = {
    comment: {
        type: String,
        required: true
    },

    username: {
        type: mongoose.Schema.Types.String,
        ref: "Profile",
        required: true
    },

    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: false
    },

    // createdAt: {
    //     type: Date,
    //     default: Date.now,
    //     required: false
    // },

    // updatedAt: {
    //     type: Date,
    //     default: Date.now,
    //     required: false
    // }
};

const collectionName = "comments";
const commentSchema = mongoose.Schema(schema,{timestamps:true});
const Comment = mongoose.model(collectionName, commentSchema);

module.exports = Comment;
