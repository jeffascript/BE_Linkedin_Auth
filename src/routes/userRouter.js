const express = require("express");
const UserModel = require("../models/UsersSchema");
const { getToken } = require("../utils/auth");
const passport = require("passport");
const usersRouter = express.Router();
const Profiles = require("../models/profileSchema");
const sgMail = require("@sendgrid/mail");

//creates username and password
usersRouter.post("/register", async (req, res) => {
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

      //send mail
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: email,
        from: "test@example.com",
        subject: "Account confirmation -LinkedInMockup",
        text: "and easy to do anywhere, even with Node.js",
        html: `<strong>confirm your account here <a href="${req.protocol}://${req.get("host")}/users/confirm/${token}"> see here </a></strong>`
      };
      await sgMail.send(msg);

      // req.body.imageUrl = req.protocol + "://" + req.get("host") + "/images/" + fileName;
      res.send({
        alert: "new profile created",
        access_token: token,
        user: newUser
      });
    }

    else{
        res.status(400).send("Cannot add this username");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

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

usersRouter.get("/confirm/:token", async (req, res) => {
  try {
    if (req.params.token) {
      res.redirect("http://localhost:3000/?confirm="+ req.params.token);
      // res.redirect('http://localhost:3000/?access_token=' + getToken({ _id: req.user._id}));
    } else {
      res.status(400).send(error);
    }
  } catch (error) {
    res.status(500).send(error);
    console.log(error);
  }
});

//check username and pass and generate a token--->local
usersRouter.post(
  "/signin",
  passport.authenticate("local"),
  async (req, res) => {
    try {
      const token = getToken({ _id: req.user._id });

      res.send({
        access_token: token,
        user: req.user
      });
    } catch (error) {
      res.status(500).send(error);
      console.log(error);
    }
  }
);

//check the access token and generate a new token--->jwt
usersRouter.post("/refresh", passport.authenticate("jwt"), async (req, res) => {
  try {
    const token = getToken({ _id: req.user._id });

    res.send({
      access_token: token,
      user: req.user
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

usersRouter.post(
  "/changepassword",
  passport.authenticate("local"),
  async (req, res) => {
    try {
      const user = await UserModel.findById(req.user._id);
      console.log(user);
      await user.setPassword(req.body.newPassword);
      user.save();
      res.send("password Changed");
    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  }
);

// usersRouter.get("/send", async (req, res) => {
//   try {
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//     const msg = {
//       to: "chijeffo@gmail.com",
//       from: "test@example.com",
//       subject: "Sending with Twilio SendGrid is Fun",
//       text: "and easy to do anywhere, even with Node.js",
//       html: "<strong>and easy to do anywhere, even with Node.js</strong>"
//     };
//     await sgMail.send(msg);
//     res.send("mail sent");
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error);
//   }
// });

module.exports = usersRouter;
