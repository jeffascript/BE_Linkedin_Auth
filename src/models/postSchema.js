const mongoose = require("mongoose");



const reactionSchema = {
    likedBy:  {
          type: String,
          unique:true,
        
      }
  };

  
const schema = { 

    text: {
        type: String,
        required: true
        
    },

    username: {
        type: mongoose.Schema.Types.String,
        ref: "profiles"
        
    },

    image: {
        type: String,
        default: "https://via.placeholder.com/150",
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
    // },

    reactions:[reactionSchema],

    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        required: false
    }
};

const collectionName = "posts";
const postSchema = mongoose.Schema(schema,{timestamps:true});
const Post = mongoose.model(collectionName, postSchema);

module.exports = Post;
