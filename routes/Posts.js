const express = require("express");
const router = express.Router();
const Posts = require("../models/Posts");
const Users = require("../models/Users");
const UserData = require("../models/UserData")
const Likes = require("../models/Likes");
const Comments = require("../models/Comments");

const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");


/*  @desc       Get all posts --paginated to 15 posts per request, most recent first.
 *  @route      GET /api/posts/
 *  @access     Private
 */
router.get("/", cookieJwtAuth, asyncHandler( async (req, res) => {
    const pageSize = 15; // <--limit data fetched (pagination)
    const page = Number(req.query.pageNumber) || 1;
    const posts = await Posts.findAll({ 
        offset: pageSize * ( page - 1), limit: 15,
        order: [ [ 'createdAt', 'DESC' ]], 
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
        },
    ]
    })
    if(posts){
        res.json(posts)
    } else {
        res.status(401)
        throw new Error("Failed to fetch posts.")
    }
}));


/*  @desc       Get post by id
 *  @route      GET /api/posts/:id
 *  @access     Private
 */
router.get("/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const post = await Posts.findOne({ 
        where: { id: req.params.id },
        order: [ [ Comments, 'createdAt', 'DESC' ]], 
        include: [{
            model: Users, 
            attributes: ['username', 'id'], 
            include: [{
                model: UserData,
                attributes: ['firstName', 'lastName', 'image']
            }]
        }, {
            model: Likes,
            attributes: ['UserId', 'id'], 
            include: [{
                model: Users, 
                attributes: ['username', 'id'], 
                include: [{
                    model: UserData,
                    attributes: ['firstName', 'lastName', 'image']
                }]
            }]
        }, {
            model: Comments,
            order: [ [ 'createdAt', 'DESC' ]],
            attributes: { exclude: ["PostId"]}, 
            include: [{
                model: Users, 
                attributes: ['username', 'id'], 
                include: [{
                    model: UserData,
                    attributes: ['firstName', 'lastName', 'image']
                }]
            }]
        },
    ]
    })
    if(post){
        res.json(post)
    } else {
        res.status(401)
        throw new Error("No data found.")
    }
}));


/*  @desc       Create post
 *  @route      POST /api/posts/create
 *  @access     Private
 */
router.post("/create", cookieJwtAuth, asyncHandler( async (req, res) => {
    const { id } = await Posts.create({ ...req.body, UserId: req.user.id})
    const post = await Posts.findByPk( id, { 
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
            attributes: ['UserId', 'comment', 'createdAt', 'updatedAt'], 
        },]
    })    
    if(post){
        res.json(post)
    } else {
        res.status(401)
        throw new Error("Failed to create post.")
    }
}));


/*  @desc       Update/Edit post
 *  @route      PUT /api/posts/:id
 *  @access     Private
 */
router.put("/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const data = req.body
    let post = await Posts.findOne({where: { id: req.params.id, UserId: req.user.id }})
    if(post){
        await post.update({...data})
        await post.save();
        res.json(post)
    } else {
        res.status(401)
        throw new Error("Not authorized.")
    }
}));


/*  @desc       Delete post
 *  @route      DELETE /api/posts/:id
 *  @access     Private
 */
router.delete("/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const post = await Posts.findOne({where: { Id: req.params.id, UserId: req.user.id }})
    if(post){
        await post.destroy();
        res.json(req.params.id)
    } else {
        res.status(401)
        throw new Error("Not authorized.")
    }
}));


/*  @desc       Like/Unlike Post
 *  @route      GET /api/posts/like/:id
 *  @access     Private
 */
router.get("/like/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const isLiked = await Likes.findOne({where: {PostId: req.params.id, UserId: req.user.id}});

    if(isLiked){
        await isLiked.destroy();
        res.json({isLiked: false, id: req.params.id, UserId: req.user.id})
    } else {
        await Likes.create({PostId: req.params.id, UserId: req.user.id})
        res.json({isLiked: true, id: req.params.id, UserId: req.user.id})
    }
}));


module.exports = router;