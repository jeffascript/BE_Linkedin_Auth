const express = require("express")
const UserModel = require("../models/UsersSchema")
const { getToken} = require ("../utils/auth")
const passport = require("passport")
const usersRouter = express.Router()
const Profiles = require("../models/profileSchema")


//creates username and password
usersRouter.post("/register", async(req,res)=>{
    try {
        
        const newUser = await UserModel.register(req.body, req.body.password);
        // const newUser = await UserModel.register(...req.body, {password:bcrypt.hashSync(password, 5)});
        if (newUser) {
          const { firstname, surname, area, email, username } = req.body;
          const newProfile = await Profiles.create({
            firstname: firstname,
            surname: surname,
            area: area,
            email: email,
            username: username,
            userId: newUser._id
          });

          newProfile.save();

          const token = getToken({ _id: newUser._id });

          res.send({
            alert: "new profile created",
            access_token: token,
            user: newUser
          });
        }

         

    } catch (err) {
        console.log(err)
        res.status(500).send(err)
        
    }
})     
        


        // "_id": "5e46923aa8989f77cae75668",
        // "firstname": "deter",
        // "surname": "dan",
        // "area": "P.A.",
        // "email": "dete@dan.com",
        // "username": "dete",

        // {
        //     "firstname": "Test",
        //     "surname": "Only",
        //     "email": "test@strive.school",
        //     "bio": "Major Key alert",
        //     "title": "TMT @ Strive School",
        //     "area": "Berlin",
        //     "username": "user123",
        //      "userId": "5e46923aa8989f77cae75668"
            
        //     }

        


    

//check username and pass and generate a token--->local
usersRouter.post("/signin",passport.authenticate("local"), async(req,res)=>{
   try {
    const token = getToken({ _id: req.user._id })
    
    
    res.send({
        access_token: token,
        user: req.user

    })
       
   } catch (error) {
       res.status(500).send(error)
       console.log(error)
   }

})

//check the access token and generate a new token--->jwt
usersRouter.post("/refresh",passport.authenticate("jwt"), async(req,res)=>{
    try {
        const token = getToken({ _id: req.user._id })
        
        
        
        res.send({
            access_token: token,
            user: req.user
    
        })
           
       } catch (error) {
           console.log(error)
           res.status(500).send(error)
       }
 
 })
 

 usersRouter.post("/changepassword", passport.authenticate("local"), async(req,res)=>{
     try {
        const user = await UserModel.findById(req.user._id)
        console.log(user)
        await user.setPassword(req.body.newPassword)
        user.save()
        res.send("password Changed")   
     } catch (error) {
         console.log(error)
         res.status(500).send(error)

     }
 })






module.exports = usersRouter

