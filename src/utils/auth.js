const LocalStrategy = require("passport-local")
const JwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const FacebookStrategy = require("passport-facebook").Strategy  //strategy to verify facebook with redirect
const UsersModel = require("../models/UsersSchema")
const ProfilesModel = require("../models/profileSchema")
const passport = require("passport")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config();



//TOKEN_PASS

passport.serializeUser(UsersModel.serializeUser())
passport.deserializeUser(UsersModel.deserializeUser())

 //passport.use(new LocalStrategy(UsersModel.authenticate())) //passport.authenticate("local")

passport.use(UsersModel.createStrategy())  //alternative forallowing you have a different entry point other than username


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


passport.use(new FacebookStrategy({
    clientID: process.env.FB_ID,
    clientSecret: process.env.FB_KEY,
    callbackURL: "http://localhost:7000/auth/facebook/callback", 
    // `${req.protocol}://${req.get("host")}/auth/facebook/callback`
    profileFields: ["id","first_name","email","location","last_name","picture"]
  
  },
  async (accessToken, refreshToken, facebookProfile, next) =>{
    try{
        const userFromFacebookId = await UsersModel.findOne({ facebookId: facebookProfile.id}) //search for a user with a give fbid
        console.log(facebookProfile)
        if (userFromFacebookId) //if we have a user we return the user
            return next(null, userFromFacebookId)
        else //we create a user starting from facebook data!
        {

            const newUser = await UsersModel.create({
      
                facebookId: facebookProfile.id,
                username: facebookProfile.emails[0].value,
                firstname: facebookProfile.name.givenName,
                surname: facebookProfile.name.familyName,
                area: facebookProfile._json.location.name,
                email: facebookProfile.emails[0].value,
                refreshToken: refreshToken
            })

            newUser.save()

            const newProfile = await ProfilesModel.create({
                firstname: facebookProfile.name.givenName,
                surname: facebookProfile.name.familyName,
                area: facebookProfile._json.location.name,
                email: facebookProfile.emails[0].value,
                username: facebookProfile.emails[0].value,
                imageUrl:facebookProfile.photos[0].value,
                facebookId: facebookProfile.id,
                userId: newUser._id
              });

              newProfile.save()
            return next(null, newUser) // pass on the new user!
        }
        //return next(null, userFromFacebookId || false)
    }
    catch(exx){
        return next (exx) //report error
    }




}))


module.exports = {
    getToken: (user) => jwt.sign(user, jwtOptions.secretOrKey, { expiresIn: 3600 * 24 }) //central point for token generation is here
}

