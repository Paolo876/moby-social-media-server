const express = require("express");
const router = express.Router();
const Posts = require("../models/Posts");
const Users = require("../models/Users");
const UserData = require("../models/UserData")
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
            attributes: ['username'], 
            include: [{
                model: UserData,
                attributes: ['firstName', 'lastName', 'image']
            }]
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
    const post = await Posts.create({ ...req.body, UserId: req.user.id})
    if(post){
        res.json(post)
    } else {
        res.status(401)
        throw new Error("Failed to fetch posts.")
    }
}));


module.exports = router;