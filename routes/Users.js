const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");   //password hash
const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const Users = require("../models/Users");
const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");

// const db = require("../config/database");


/*  @desc       Login user & get token
 *  @route      POST /api/auth/login
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
 *  @route      GET /api/auth/authorize
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
 *  @route      GET /api/auth/signup
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


/*  @desc       logout user, clear saved token on browser
 *  @route      GET /api/auth/logout
 *  @access     Public
 */
router.get("/logout", asyncHandler( async (req,res) => {
    res.cookie("token", 'none', { secure: true, sameSite: "none", path:"/", domain: process.env.NODE_ENV === "local" ? "localhost": ".paolobugarin.com", httpOnly: true , expires: new Date(Date.now() + 2 * 1000),})
    res
        .status(201)
        .send({ message: 'User logged out successfully' })

}))

module.exports = router;