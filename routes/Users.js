const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");   //password hash
const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/generateToken");
const sequelize = require('sequelize');
const ImageKit = require("imagekit");
const Users = require("../models/Users");
const UserData = require("../models/UserData");
const UserStatus = require("../models/UserStatus");
const UserBio = require("../models/UserBio");
const Posts = require("../models/Posts");
const Likes = require("../models/Likes");
const Comments = require("../models/Comments");
const Bookmarks = require("../models/Bookmarks");


/*  @desc       Login user & get token
 *  @route      POST /api/auth/login
 *  @access     Public
 */
router.post("/login", asyncHandler( async (req, res) => {
    const { username, password } = req.body;
    const user = await Users.findOne({ 
        where: { username }, 
        include: [{
            model: UserData,
            attributes: ['firstName', 'lastName', 'image'],
        }, {
            model: UserStatus,
            attributes: ['status'],
        }
    ]});
    if(user && (await bcrypt.compare(password, user.password))){
        const { id, username, UserDatum } = user;
        const token = generateToken(id)
        res.cookie("token", token, { secure: true, sameSite: "none", path:"/", domain: process.env.NODE_ENV === "local" ? "localhost": ".paolobugarin.com", httpOnly: true }) //send the user id on token
        res.json({id, username, UserData: UserDatum, UserStatus: user.UserStatus})
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
    const pageSize = 5; // <--limit data fetched (pagination)
    const page = Number(req.query.pageNumber) || 1;

    const id = req.params.id
    const user = await Users.findOne({ 
        where: { id }, 
        attributes: ['username', 'id', 'createdAt'], 
        include: [
            {
                model: UserData,
                attributes: ['firstName', 'lastName', 'image', 'birthday']
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
        ],
        order: [ [ Posts, 'createdAt', 'DESC' ]], 

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
    const user = await Users.findByPk(req.user.id, { include: [{model: UserData}, { model: UserStatus, attributes: ['status']}] })
    const { id, username, UserDatum,  } = user;

    if(user){
        res.json({id, username, UserData: UserDatum, UserStatus: user.UserStatus})
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
        res.status(201).json({id, username, UserData: null, UserStatus: { status: "online"}})
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
    const bookmarks = await Bookmarks.findAll({ 
        where: { UserId: req.user.id }, 
        attributes: ["PostId"],
        order: [ [ 'createdAt', 'DESC' ]], 
        include: {
            model: Posts,
            include: [{
                model: Users, 
                attributes: ['username', 'id'], 
                include: [{
                    model: UserData,
                    attributes: ['firstName', 'lastName', 'image']
                }]
            }, {
                model: Likes,
                attributes: ['UserId'], 
            }, {
                model: Comments,
                attributes: ['UserId', 'id'], 
            }]
        }
    });

    if(bookmarks){
        res.json(bookmarks)
    } else {
        res.status(401)
        throw new Error("Not authorized.")
    }
}))


/*  @desc       Search users [implemented on chat search]
 *  @route      GET /api/auth/search/:q
 *  @access     Private
 */
router.get("/search/:q", cookieJwtAuth, asyncHandler( async (req,res) => {
    const query = req.params.q.toLowerCase();
    
    const users = await Users.findAll({
        attributes: ['username', 'id'], 
        include: {
            model: UserData,
            attributes: ['firstName', 'lastName', 'image'],
            required: true
        },
        where: {
            id: { [sequelize.Op.not]: req.user.id },    //don't include self on search
            [sequelize.Op.or]: [
                { 'username': { [sequelize.Op.like]: '%' + query + '%' } },
                { '$UserDatum.firstName$': { [sequelize.Op.like]: '%' + query + '%' } },
                { '$UserDatum.lastName$': { [sequelize.Op.like]: '%' + query + '%' } },
                // sequelize.where(
                //     sequelize.fn('concat', '$UserDatum.lastName$', ' ', '$UserDatum.lastName$'), {
                //         [sequelize.Op.like]: '%'+query+'%'
                //     }
                //   )
            ],
        }
    })

    if(users){
        res.json(users)
    } else {
        res.status(401)
        throw new Error("Failed to fetch users.")
    }
}))


/*  @desc       Get user and userData only
 *  @route      GET /api/auth/userData/:id
 *  @access     Private
 */
router.get("/userData/:id", cookieJwtAuth, asyncHandler( async (req,res) => {
    const user = await Users.findByPk(req.params.id, {
        attributes: ['username', 'id'], 
        include: {
            model: UserData,
            attributes: ['firstName', 'lastName', 'image'],
            required: true
        },
    })

    if(user){
        res.json(user)
    } else {
        res.status(401)
        throw new Error("No user found.")
    }
}))


/*  @desc       Update user profile picture [settings page]
 *  @route      PUT /api/auth/update-profile-picture
 *  @access     Private
 */
router.put("/update-profile-picture", cookieJwtAuth, asyncHandler( async (req,res) => {
    const isNewProfilePicture = req.body.isNewProfilePicture;
    const user = await Users.findByPk(req.user.id)

    if(user){
        const userData = await UserData.findOne({ where: { UserId: req.user.id}});
        const imagekit = new ImageKit({
            publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
        });
        if(userData){
            const image = JSON.parse(userData.image)

            if(isNewProfilePicture){
                //if UserData has image, delete file from imagekit the upload new image
                if(image) {
                    //delete from imagekit
                    imagekit.deleteFile(image.fileId, async (error) => {
                        if(error) {
                            res.status(401)
                            throw new Error("An error has occurred. Please try again.")
                        } else {
                            //update image property
                            await userData.update({image : req.body.image})
                            await userData.save();
                            res.json({image: req.body.image})
                        }
                    });
                } else {
                    await userData.update({image : req.body.image})
                    await userData.save();
                    res.json({image: req.body.image})
                }
            } else {
                //delete from imagekit
                imagekit.deleteFile(image.fileId, async (error) => {
                    if(error) {
                        res.status(401)
                        throw new Error("An error has occurred. Please try again.")
                    } else {
                        //remove image
                        await userData.update({image : null})
                        await userData.save();
                        res.json({image: null})
                    }
                });
            }
        }
    } else {
        res.status(401)
        throw new Error("Not authorized.")
    }
}))



/*  @desc       Change user status
 *  @route      PUT /api/auth/update-status
 *  @access     Private
 */
router.put("/update-status", cookieJwtAuth, asyncHandler( async (req,res) => {
    const status = req.body.status;
    const updatedUserStatus = await UserStatus.findOne({ where: { UserId: req.user.id}})
    updatedUserStatus.status = status;
    updatedUserStatus.save();
    res.json({status})
}))


/*  @desc       Update user informations [settings page]
 *  @route      PUT /api/auth/update-settings
 *  @access     Private
 */
router.put("/update-settings", cookieJwtAuth, asyncHandler( async (req,res) => {
    const user = await Users.findByPk(req.user.id)

    if(user){

        // update UserData
        const updatedUserData = await UserData.findOne({ where: { UserId: req.user.id}})
        if(updatedUserData){
            await updatedUserData.update({...req.body.UserData})
            await updatedUserData.save();
        } else {
            await UserData.create({...req.body.UserData, UserId : req.user.id})
        }

        // update UserBio
        const updatedUserBio = await UserBio.findOne({ where: { UserId: req.user.id}})
        if(updatedUserBio){
            await updatedUserBio.update({...req.body.UserBio})
            await updatedUserBio.save();
        } else {
            await UserBio.create({...req.body.UserBio, UserId : req.user.id})
        }
        
        res.json(req.body)
    } else {
        res.status(401)
        throw new Error("Not authorized.")
    }
}))


module.exports = router;