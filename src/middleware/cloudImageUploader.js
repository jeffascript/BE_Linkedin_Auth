const multer = require('multer');
const cloudinary = require('cloudinary').v2
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

const imageFilter = function (req, file, cb) {

    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter})


const cloud = cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET
  });

  const breakpoints = { responsive_breakpoints: 
    { create_derived: true, 
      bytes_step: 20000, 
      min_width: 200, 
      max_width: 1000 }}

module.exports = {
    uploadMulterToCloudinary: upload,
    breakpoints,
    cloudConfig : cloud
}