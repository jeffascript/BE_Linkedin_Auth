const express = require("express")
const passport = require("passport") 
const dotenv = require("dotenv")
dotenv.config()
const listEndPoints = require("express-list-endpoints")
const cors = require("cors")
const path = require("path")

const profileRoute = require("./src/routes/profileRouter")
const experienceRoute = require("./src/routes/experienceRouter")
const postRoute = require("./src/routes/postRouter")
const likesRoute = require("./src/routes/likesRouter")
const commentRoute = require("./src/routes/commentRouter")
const usersRoute = require("./src/routes/userRouter")
const authRoute = require("./src/routes/authRouter")

const server = express()
server.use(express.json())
server.use(passport.initialize())
const mongoose_db = require("./src/db")

const Port = process.env.PORT || 7001

mongoose_db

server.use(cors())

/*
 var whitelist = ['http://localhost:3000', http://localhost:3001']
 var corsOptions = {
   origin: function (origin, callback) {
     if (whitelist.indexOf(origin) !== -1) {
       callback(null, true)
     } else {
       callback(new Error('Not allowed by CORS'))
     }
   }
 }
*/

// server.use( express.static(path.join(__dirname, "/images/posts/")))--> meaning get images from images/post directory but display at localhost/img.jpg

server.use("/images/posts/",express.static(path.join(__dirname,'/images/posts'))) // for post images

server.use("/images/",express.static(path.join(__dirname,'/images/'))) //for profile images

server.use("/profiles", profileRoute)
server.use("/experiences", experienceRoute)

server.use("/posts", postRoute)

server.use("/likes", likesRoute)

server.use("/comments", commentRoute)

server.use("/users", usersRoute)
server.use("/auth", authRoute)
server.get("/", (req,res)=>{
    res.send("server alive " + new Date ())
})






console.log(listEndPoints(server))

server.listen(Port, ()=>console.log(`server running on ${Port}`))


// const stringifiedID = new mongoose.Types.ObjectId(req.user._id)
// if (!stringifiedID.equals(req.user._id)){
// res.status(401).send("You do not have the authorization to edit this comment")
// }




