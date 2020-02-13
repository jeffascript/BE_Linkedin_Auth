const express = require("express")
const dotenv = require("dotenv")
dotenv.config()
const cors = require("cors")



const server = express()


const port = process.env.PORT || 7001


server.get("/", (req,res)=>{
    res.send("server alive")
})


server.use(cors())

server.use(express.json())


server.listen(port, ()=>console.log(`server running on ${port}`))






