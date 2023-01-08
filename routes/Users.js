const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");   //password hash
const { sign } = require('jsonwebtoken');
const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const Users = require("../models/Users");
const { Op } = require("sequelize");
const asyncHandler = require("express-async-handler");

// const db = require("../config/database");


/*  @desc       Login user & get token
 *  @route      POST /api/users/login
 *  @access     Public
 */
router.post("/login", asyncHandler( async (req, res) => {
    const { username, password } = req.body;
    const user = await Users.findOne({ where: { username }});

    // if(user && (await bcrypt.compare(password, user.password)))

    if(user && (await bcrypt.compare(password, user.password))){
        const { id, username } = user;
        res.json({id, username})
    }
    // if(!user){
    //     res.status(401)
    //     throw new Error("Invalid email or password.")
    // } else{
    //     bcrypt.compare(password, user.password).then( async (match) => {       
    //         if(!match) {
    //             res.json({error: "The password you entered is incorrect."});
    //         } else{
    //             //set isLoggedInto true
    //             await Users.update({isLoggedIn: true}, { where: { username } });
    //             const responseData = {
    //                 username: user.username, 
    //                 id: user.id, 
    //                 userInformation: JSON.parse(user.userInformation), 
    //             }
    //             const accessToken = sign(responseData, "O7UWf2eGMQNppvpbhd7fHikgUI52P6uwcqMUV4194aeUW88tgxmSVqKFEVzugdm");
    //             res.json({accessToken, ...responseData });   
    //         }
    //     })    
    // }
}));

/*  @desc       authorize token from cookie
 *  @route      GET /api/users/authorize
 *  @access     Private
 */
router.get("/authorize", cookieJwtAuth, asyncHandler( async (req,res) => {
    const user = await Users.findByPk(req.user.id)
    console.log(user)
    if(user){
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            picture: user.picture,
            googleId: user.googleId,
        })
    } else {
        res.clearCookie("token");
        throw new Error("Not authorized, invalid token.")
    }
}))


// router.get("/", async (req,res) => {
//     const users = await Users.findAll({ attributes: ['id', 'username']})
//     res.json(users)
// })

module.exports = router;