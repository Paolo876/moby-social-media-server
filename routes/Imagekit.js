const express = require("express");
const router = express.Router();
const fs = require("fs")
const { v4: uuidv4 } = require('uuid')

const asyncHandler = require("express-async-handler");
const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const ImageKit = require('imagekit');

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
});

/*  @desc       get authenticationEndpoint object
 *  @route      GET /api/imagekit
 *  @access     Private
 */
router.get('/', cookieJwtAuth, asyncHandler((req, res) => {
    var result = imagekit.getAuthenticationParameters(uuidv4());
    res.send(result);
}));

// upload product image
router.post("/product-image", asyncHandler((req,res) => {
}));

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
