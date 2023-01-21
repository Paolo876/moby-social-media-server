const express = require("express");
const router = express.Router();
const Posts = require("../models/Posts");
const Users = require("../models/Users");
const UserData = require("../models/UserData")
const Likes = require("../models/Likes");

const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");


/*  @desc       Get posts --paginated to 15 posts per request
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

        }]
    })
    if(posts){
        res.json(posts)
    } else {
        res.status(401)
        throw new Error("Failed to fetch posts.")
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
        }]
    })    
    if(post){
        res.json(post)
    } else {
        res.status(401)
        throw new Error("Failed to create post.")
    }
}));


/*  @desc       Delete post
 *  @route      DELETE /api/posts/:id
 *  @access     Private
 */
router.delete("/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const post = await Posts.findByPk(req.params.id)
    if(post && post.UserId === req.user.id){
        await post.destroy();
        res.json(req.params.id)
    } else {
        res.status(401)
        throw new Error("Not authorized.")
    }
}));


/*  @desc       Like/Unlike Post
 *  @route      POST /api/posts/like/:id
 *  @access     Private
 */
router.put("/like/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const isLiked = await Likes.findOne({where: {PostId: req.params.id, UserId: req.user.id}});

    if(isLiked){
        await isLiked.destroy();
        res.json({isLiked: false, id: req.params.id})
    } else {
        await Likes.create({PostId: req.params.id, UserId: req.user.id})
        res.json({isLiked: true, id: req.params.id})
    }
}));


module.exports = router;