const express = require("express");
const router = express.Router();
const Posts = require("../models/Posts");
const Users = require("../models/Users");
const UserData = require("../models/UserData")
const Bookmarks = require("../models/Bookmarks")
const Likes = require("../models/Likes");
const Comments = require("../models/Comments");
const ImageKit = require("imagekit");

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
                attributes: ['firstName', 'lastName', 'image'],
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
    const bookmarks = await Bookmarks.findAll({
        where: { UserId: req.user.id},
        attributes: ["PostId"]
    })
    if(posts){
        res.json({posts, bookmarks})
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

    const isBookmarked = await Bookmarks.findOne({where: { PostId: req.params.id, UserId: req.user.id }})
    
    if(post){
        res.json({post, isBookmarked: isBookmarked ? true : false})
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
    const data = req.body.data;
    const isImageNew = req.body.isImageNew;
    const post = await Posts.findOne({where: { id: req.params.id, UserId: req.user.id }})
    if(post){
        const imagekit = new ImageKit({
            publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
        });
        
        if(post.image && isImageNew){    //if image is deleted on post
            const image = JSON.parse(post.image)
            imagekit.deleteFile(image.fileId, async (error) => {
                if(error) {
                    res.status(401)
                    throw new Error("An error has occurred. Please try again.")
                } else {
                    await post.update({...data})
                    await post.save();
                    res.json(post)
                }
            });
        } else {
            await post.update({...data})
            await post.save();
            res.json(post)
        }
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
    const post = await Posts.findOne({where: { id: req.params.id, UserId: req.user.id }})
    if(post){
        if(post.image){
            const imagekit = new ImageKit({
                publicKey : process.env.IMAGEKIT_PUBLIC_KEY,
                privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
                urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT
            });
            const image = JSON.parse(post.image)

            imagekit.deleteFile(image.fileId, async (error) => {
                if(error) {
                    res.status(401)
                    throw new Error("An error has occurred. Please try again.")
                } else {
                    //delete post
                    await post.destroy();
                    res.json(req.params.id)
                }
            });
        }else {
            await post.destroy();
            res.json(req.params.id)
        }

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


/*  @desc       bookmark Post
 *  @route      GET /api/posts/bookmark/:id
 *  @access     Private
 */
router.get("/bookmark/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const isBookmarked = await Bookmarks.findOne({where: {PostId: req.params.id, UserId: req.user.id}});

    if(isBookmarked){
        await isBookmarked.destroy();
        res.json({isBookmarked: false, PostId: req.params.id, UserId: req.user.id})
    } else {
        await Bookmarks.create({PostId: req.params.id, UserId: req.user.id})
        res.json({isBookmarked: true, PostId: req.params.id, UserId: req.user.id})
    }
}));


/*  @desc       authorize post. fetched before edit, check if the user logged in is the post's author
 *  @route      GET /api/posts/bookmark/:id
 *  @access     Private
 */
router.get("/authorize/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const post = await Posts.findOne({where: { id: req.params.id, UserId: req.user.id}});

    if(post){
        res.json(post)
    } else {
        res.status(401)
        throw new Error("Not authorized.")}
}));


module.exports = router;