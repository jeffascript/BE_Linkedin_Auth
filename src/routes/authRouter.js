const express = require("express")
const passport = require("passport")

const { getToken } = require("../utils/auth")

const authsRouter = express.Router()



authsRouter.get('/facebook', passport.authenticate('facebook', { scope: ["user_location", "email"]}));

authsRouter.get('/facebook/callback',
passport.authenticate('facebook', { failureRedirect: '/login' }),
function(req, res) {
  // Successful authentication, redirect home.
  res.redirect(process.env.FE_URL +'/callback?access_token=' + getToken({ _id: req.user._id,username: req.user.username}) + "&username=" + req.user.username);
});

{/* <a href="${req.protocol}://${req.get("host")}/users/confirm/${token}"> */}



module.exports = authsRouter