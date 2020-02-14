const mongoose = require("mongoose")

/*
{
    "_id": "5d925e677360c41e0046d1f5",  //server generated
    //user who liked it (as reference? nested? Your choice!)
    //post liked (as reference? nested? Your choice!)
    "createdAt": "2019-09-30T19:58:31.019Z",  //server generated
    "updatedAt": "2019-09-30T19:58:31.019Z",  //server generated
}  
*/



const likeSchema = new mongoose.Schema({
user:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"profiles"
}],

post:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:"posts"
}]



});

const collectionName = "likes"

const Likes = mongoose.model(collectionName,likeSchema)

module.exports = Likes;