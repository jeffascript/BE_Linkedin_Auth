const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")
const { isEmail } = require("validator");



const UsersSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    
    surname: {
        type: String,
        required: true
    },

    area: {
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

    username: {
        type: String,
        required: true,
        unique: true
    }
    

});

UsersSchema.plugin(passportLocalMongoose ,{ usernameField : 'email' }) //

const collectionName = "usersList"

const UsersModel = mongoose.model(collectionName, UsersSchema);

module.exports = UsersModel


