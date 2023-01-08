const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");   //password hash
const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const Users = require("../models/Users");
const { Op } = require("sequelize");
const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");

// const db = require("../config/database");


/*  @desc       Login user & get token
 *  @route      POST /api/users/login
 *  @access     Public
 */
router.post("/login", asyncHandler( async (req, res) => {
    const { username, password } = req.body;
    const user = await Users.findOne({ where: { username }});

    if(user && (await bcrypt.compare(password, user.password))){
        const { id, username } = user;
        const token = generateToken(id)
        res.cookie("token", token, { secure: true, sameSite: "none", path:"/", domain: process.env.NODE_ENV === "local" ? "localhost": ".paolobugarin.com", httpOnly: true }) //send the user id on token
        res.json({id, username})
    } else {
        res.status(401)
        throw new Error("Invalid email or password.")
    }
}));


/*  @desc       authorize token from cookie
 *  @route      GET /api/users/authorize
 *  @access     Private
 */
router.get("/authorize", cookieJwtAuth, asyncHandler( async (req,res) => {
    const user = await Users.findByPk(req.user.id)
    const { id, username } = user;

    if(user){
        res.json({id, username})
    } else {
        res.clearCookie("token");
        throw new Error("Not authorized, invalid token.")
    }
}))


/*  @desc       sign up/create a new user
 *  @route      GET /api/users/authorize
 *  @access     Public
 */
router.post("/signup", asyncHandler( async (req,res) => {
    const isTaken = await Users.findOne({ where: { username: req.body.username } });
    if(isTaken){ 
        res.status(400)
        throw new Error("Username already exists.") 
    }

    const user = await Users.create({ ...req.body })
    if(user){  
        const { id, username } = user;
        const token = generateToken(id)
        res.cookie("token", token, { secure: true, sameSite: "none", path:"/", domain: process.env.NODE_ENV === "local" ? "localhost": ".paolobugarin.com", httpOnly: true }) //send the user id on token
        res.status(201).json({id, username})
    } else {
        res.status(400)
        throw new Error("Invalid user data.")
    }
}))



module.exports = router;