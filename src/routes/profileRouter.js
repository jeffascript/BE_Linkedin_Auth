const express = require("express");
const passport = require("passport")
const Profiles = require("../models/profileSchema");
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const profileRouter = express.Router();
const generatePDF = require("../pdfConfig/pdfCreator");
const json2csv = require("json2csv").parse;
const mongoose = require("mongoose")


//  profileRouter.get("/", Profile.getAll);

// profileRouter.post("/", Profile.create);

profileRouter.get("/", async (req, res) => {
    const profilesCount = await Profiles.countDocuments();

    try {
        const query = req.query;
        const { limit, skip, sort } = query;
        delete query.limit;
        delete query.skip;
        delete query.sort;
        const profileList = await Profiles.find(query)
            .sort({ [sort]: 1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        res.send({ Total: profilesCount, profileList });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

profileRouter.get("/:id", async (req, res) => {
    try {
        const profile = await Profiles.findById(req.params.id);
        if (profile) {
            res.send(profile);
        } else {
            res.status(404).send("Cannot find the profile with the id");
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

profileRouter.get("/username/:username", passport.authenticate("jwt"), async (req, res) => {
    try {
       
        let username = { username: req.params.username };
        const profile = await Profiles.findOne(username);
        if (!profile) {
            res.status(404).send("Cannot find the profile with the username");
         
        }
            // const reqUser = req.user.username
            // const reqParam = req.params.username
            //console.log(reqUser +  " is equal to " + reqParam)

            if(req.user.username !==req.params.username){
            res.status(401).send("cannot modify another user")
        }

        // if (req.user._id.toString() !== req.params.userId && req.user.role !== "Admin")
        // return res.status(401).send("cannot modify another user")

        // const stringifiedID = new mongoose.Types.ObjectId(req.user._id)
        // if(!stringifiedID.equals(req.user._id)){
        // return res.status(401).send("You can only view your profile")
        // }
    

          res.send(profile);

    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//get all experiences for a profile.username
profileRouter.get("/:username/experiences",passport.authenticate("jwt"), async (req, res) => {
    try {
        if(req.user.username!== req.params.username){
            res.status(401).send("You can only get your experience")
        }

        console.log(req.params.username);
        const profile = await Profiles.findOne(
            { username: req.params.username },
            { experience: 1, _id: 0 }
        );
        res.send(profile.experience);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//get one experience with ID
profileRouter.get("/experiences/:expId/", async (req, res) => {
    try {
        const experience = await Profiles.find(
            { "experience._id": req.params.expId },
            { _id: 0, "experience.$": 1 }
        );
        res.send(experience);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

profileRouter.get("/pdf/:username/cv", async (req, res) => {
    try {
        const profileToPDF = await Profiles.findOne({
            username: req.params.username
        });
        if (!profileToPDF) {
            res.status(404).send("Not Found");
        } else {
            await generatePDF(profileToPDF);
            console.log(profileToPDF.username);
            const file = path.join(__dirname,`../pdfConfig/${profileToPDF.username}.pdf`
            );
            res.setHeader(
                "Content-Disposition",`attachment; filename=${req.params.username}.pdf`);
            fs.createReadStream(file).pipe(res);
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

//Download the experiences as a CSV
// userName/experiences/CSV

profileRouter.get("/get/CSV/:username/experiences", async (req, res) => {
    try {
        const profile = await Profiles.findOne({
            username: req.params.username
        });
        const fields = ["company", "role", "title"];
        const opts = { fields };
        let csv = json2csv(profile.experience, opts);
        res.setHeader("Content-Disposition", `attachment; filename=file.csv`);
        res.send(csv);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

profileRouter.post("/",passport.authenticate("jwt"), async (req, res) => {
    // let newInfo = {...req.body,
    //     createdAt: new Date()}

    try {
        req.body.userId = req.user._id

        const newProfile = await Profiles.create(req.body);

        newProfile.save();
        res.send(newProfile);
    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
});

const multerConfig = multer({});
profileRouter.post(
    "/:username/picture",
    multerConfig.single("profileImg"), passport.authenticate("jwt"), 
    async (req, res) => {
        try {
            
    
         
          if(req.user.username !== req.params.username){
            return res.status(401).send("You can only edit your profile")
            
          }
    


            const fileName =
                req.params.username + path.extname(req.file.originalname);

            const newImageLocation = path.join(__dirname,"../../images",fileName);
            await fs.writeFile(newImageLocation, req.file.buffer);

            req.body.imageUrl = req.protocol + "://" + req.get("host") + "/images/" + fileName;

            const newProfileUrl = await Profiles.findOneAndUpdate(
                { username: req.params.username },
                {
                    $set: { imageUrl: req.body.imageUrl }
                }
            );

            newProfileUrl.save();
            res.send("Image URL updated");
        } catch (ex) {
            res.status(500).send(ex);
            console.log(ex);
        }
    }
);

profileRouter.put("/:id", passport.authenticate("jwt"), async (req, res) => {
  delete req.body._id;

  try {
    const user = await Profiles.findById(req.params.id);
    if (!user) {
      return res.status(404).send("not found");
    }

    const stringifiedID = new mongoose.Types.ObjectId(req.user._id);

    // if (req.user._id.toString() !== req.params.Id && req.user.role !== "Admin")
    // return res.status(401).send("cannot modify another user")

    if (!stringifiedID.equals(req.user._id)) {
      return res.status(401).send("You can only edit your profile");
    }

    const profileForEdit = await Profiles.findByIdAndUpdate(req.params.id, {
      $set: req.body

      //  $set: {
      // ...req.body,
      //  updatedAt: new Date()
      //  }
    });

    res.send("Updated");
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

profileRouter.delete("/:id", passport.authenticate("jwt"), async (req, res) => {
    try {

        const userID = await Profiles.findOne({userId: req.user._id})
        console.log(userID.userId.toString())
    
        if(req.user._id.toString()!== userID.userId.toString()){
            res.status(401).send("You can only edit your profile")
        }
    //   const stringifiedID = new mongoose.Types.ObjectId(req.user._id)
    //   const stringifiedUserID = new mongoose.Types.ObjectId(userID.userId)
    //   if(!stringifiedID.equals(stringifiedUserID)){
    //     return res.status(401).send("You can only edit your profile") 
    //   }

        const user = await Profiles.findById(req.params.id)
        if(!user){
            return res.status(404).send(`profile with id: ${req.params.id} not found for deletion!`)
        }
  
         const deletedProfile = await Profiles.findByIdAndDelete(req.params.id);
         if (deletedProfile) 
            res.send(" Successffully Deleted");
       
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

profileRouter.post("/experience/:username", passport.authenticate("jwt"),  async (req, res) => {
    // let newInfo = {...req.body,
    //     createdAt: new Date()}

    try {
        const user = await Profiles.findOne({username:req.params.username})
        if(!user){
            return res.status(404).send("user not found")
        }

      if(req.user.username !== req.params.username){
        return res.status(401).send("You can only edit your profile")
      }
        
       

        req.body._id = mongoose.Types.ObjectId()
       

        const newProject = req.body;
        const addProfileExperience = await Profiles.findOneAndUpdate(
            { username: req.params.username },
            {
                $push: { experience: newProject }
            }
        );


        console.log(addProfileExperience.experience);
        res.send(newProject);
    } catch (error) {
        res.status(500).send(error);
        console.log(error);
    }
});



module.exports = profileRouter