const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");   //password hash
const { sign } = require('jsonwebtoken');
const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const Users = require("../models/Users");
const { Op } = require("sequelize");

// const db = require("../config/database");


/*  @desc       Auth user & get token
 *  @route      POST /api/users/login
 *  @access     Public
 */
router.post("/", async (req, res) => {
    const { username, password } = req.body;
    const isTaken = await Users.findOne({ where: { username }});
    if(isTaken){
        res.json({error: "Username already exists."})
    }else{
        bcrypt.hash(password, 10).then( async (data) => {
            const user = await Users.create({
                username,
                password: data,
            })
            const responseData = {
                username: user.username, 
                id: user.id, 
                isLoggedIn : user.isLoggedIn, 
                userStatus: user.userStatus,
                userInformation: null, 
                userFriends: null,
            }
            //save to accessToken
            const accessToken = sign(responseData, "O7UWf2eGMQNppvpbhd7fHikgUI52P6uwcqMUV4194aeUW88tgxmSVqKFEVzugdm");
            res.json({accessToken, ...responseData});
        })
    }
});


router.get("/", async (req,res) => {
    const users = await Users.findAll({ attributes: ['id', 'username']})
    res.json(users)
})

module.exports = router;