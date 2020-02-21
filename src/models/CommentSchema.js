const mongoose = require("mongoose");

const schema = {
    comment: {
        type: String,
        required: true
    },

    username: {
        type: mongoose.Schema.Types.String,
        ref: "profiles",
        required: true
    },

    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts",
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
