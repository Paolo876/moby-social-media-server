const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");   //password hash
const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const Users = require("../models/Users");
const UserData = require("../models/UserData");
const UserBio = require("../models/UserBio");
const Posts = require("../models/Posts");
const Likes = require("../models/Likes");
const Comments = require("../models/Comments");
const Bookmarks = require("../models/Bookmarks");

const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");


/*  @desc       Login user & get token
 *  @route      POST /api/auth/login
 *  @access     Public
 */
router.post("/login", asyncHandler( async (req, res) => {
    const { username, password } = req.body;
    const user = await Users.findOne({ where: { username }, include: [{model: UserData}]});
    if(user && (await bcrypt.compare(password, user.password))){
        const { id, username, UserDatum } = user;
        const token = generateToken(id)
        res.cookie("token", token, { secure: true, sameSite: "none", path:"/", domain: process.env.NODE_ENV === "local" ? "localhost": ".paolobugarin.com", httpOnly: true }) //send the user id on token
        res.json({id, username, UserData: UserDatum})
    } else {
        res.status(401)
        throw new Error("Invalid email or password.")
    }
}));


/*  @desc       Get User profile data
 *  @route      GET /api/auth/profile/:id
 *  @access     Public
 */
router.get("/profile/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const id = req.params.id
    const user = await Users.findOne({ 
        where: { id }, 
        attributes: ['username', 'id', 'createdAt'], 
        order: [ [ Posts, 'createdAt', 'DESC' ]], 
        include: [
            {
                model: UserData,
                attributes: ['firstName', 'lastName', 'image']
            },{
                model: UserBio,
                attributes: ['body', 'links']
            },{
                model: Posts,
                attributes: ['id', 'title', 'postText', 'image', 'isPublic', 'createdAt'],
                include: [{
                    model: Likes,
                    attributes: ['UserId'], 
                }, {
                    model: Comments,
                    attributes: ['UserId', 'id'], 
                }]
            },
        ]
    });
    if(user){
        res.json(user)
    } else {
        res.status(401)
        throw new Error("No data found.")
    }
}));


/*  @desc       authorize token from cookie
 *  @route      GET /api/auth/authorize
 *  @access     Private
 */
router.get("/authorize", cookieJwtAuth, asyncHandler( async (req,res) => {
    const user = await Users.findByPk(req.user.id, { include: [{model: UserData}] })
    const { id, username, UserDatum } = user;

    if(user){
        res.json({id, username, UserData: UserDatum})
    } else {
        res.clearCookie("token");
        throw new Error("Not authorized, invalid token.")
    }
}))


/*  @desc       sign up/create a new user
 *  @route      POST /api/auth/signup
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
        res.status(201).json({id, username, UserData: null})
    } else {
        res.status(400)
        throw new Error("Invalid user data.")
    }
}))


/*  @desc       setup the profile of a new user.
 *  @route      POST /api/auth/signup
 *  @access     Private
 */
router.post("/profile-setup", cookieJwtAuth, asyncHandler( async (req,res) => {
    const UserId = req.user.id;
    const { firstName, lastName, birthday, image } = req.body;
    const userData = await UserData.create({ UserId, firstName, lastName, birthday, image})
    if(userData){
        res.status(200).json(userData)
    } else {
        res.status(400)
        throw new Error("Failed to fetch data from server.")
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


/*  @desc       Get User's bookmarked posts
 *  @route      GET /api/auth/bookmarks
 *  @access     Private
 */
router.get("/bookmarks", cookieJwtAuth, asyncHandler( async (req,res) => {
    const bookmarks = await Bookmarks.findAll({ where: { UserId: req.user.id }, attributes: ["PostId"]});

    if(bookmarks){
        res.json(bookmarks)
    } else {
        res.status(401)
        throw new Error("Not authorized.")
    }
}))

module.exports = router;