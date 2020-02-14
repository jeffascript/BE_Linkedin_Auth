// Profile Schema model
// Embedded we have the Experience as []
const mongoose = require("mongoose");
const { isEmail } = require("validator");

const experienceSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    }, 
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: false
    },
    description: {
        type: String,
        required: false
    },

    area: {
        type: String,
        required: true
    },
  

    username: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false,
        default: "https://via.placeholder.com/150"
    }
}, {timestamps:true});

const profileSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },

    surname: {
        type: String,
        required: true
    },

    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: true,
        validate: {
            validator: string => isEmail(string),
            message: "Provided email is invalid"
        }
    },

    bio: {
        type: String,
        
    },

    title: {
        type: String,
        
    },

    area: {
        type: String,
        required: true
    },

    imageUrl: {
        type: String,
        required: false,
        default: "https://via.placeholder.com/150"
    },

    username: {
        type: String,
        required: true,
        unique: true
    },

    experience: [experienceSchema],

    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'usersList'}

  
},{timestamps:true});

const collectionName = "profiles";
const Profile = mongoose.model(collectionName, profileSchema);

module.exports = Profile;
