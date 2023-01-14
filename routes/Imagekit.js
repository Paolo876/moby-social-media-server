const express = require("express");
const router = express.Router();
const fs = require("fs")
const { uuid } = require('uuidv4');

const asyncHandler = require("express-async-handler");
const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
// const adminMiddleware = require("../middlewares/adminMiddleware");
const ImageKit = require('imagekit');

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

// get authentication
router.get('/', (req, res) => {
    var result = imagekit.getAuthenticationParameters(uuid());
    res.send(result);
});

// upload product image
router.post("/product-image", asyncHandler((req,res) => {
    
}))
//delete image
// router.delete("/delete/:id", validateToken, (req,res) => {
//     const id = req.params.id;

//     imagekit.deleteFile(id, function(error, result) {
//         if(error) {
//             res.json({error}); 
//         } else {
//             res.json(id)
//         }
//     });
// })




module.exports = router;
