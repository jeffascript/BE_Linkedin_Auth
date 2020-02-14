const LocalStrategy = require("passport-local")
const JwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const UsersModel = require("../models/UsersSchema")
const passport = require("passport")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config();


//TOKEN_PASS

passport.serializeUser(UsersModel.serializeUser())
passport.deserializeUser(UsersModel.deserializeUser())

 //passport.use(new LocalStrategy(UsersModel.authenticate())) //passport.authenticate("local")

passport.use(UsersModel.createStrategy())

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.TOKEN_PASS 
}

passport.use(new JwtStrategy(jwtOptions, (jwtPayload, callback) =>{ // passport.authenticate("jwt")
    UsersModel.findById(jwtPayload._id, (err, user) => { 
        if (err) return callback(err, false) // issues getting the info from the db
        else if (user) return callback(null, user) //  Existing user
        else return callback(null, false) // Non-existing user
    })
  
}))

module.exports = {
    getToken: (user) => jwt.sign(user, jwtOptions.secretOrKey, { expiresIn: 3600 }) //central point for token generation is here
}

