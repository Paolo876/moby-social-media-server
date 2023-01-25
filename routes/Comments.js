const express = require("express");
const router = express.Router();
const Comments = require("../models/Comments");

const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");


/*  @desc       create a new comment for a post
 *  @route      POST /api/comments/new-comment
 *  @access     Private
 */
router.post("/new-comment", cookieJwtAuth, asyncHandler( async (req, res) => {
    const comment = await Comments.create({ ...req.body, UserId: req.user.id})
    if(comment){
        res.json(comment)
    } else {
        res.status(401)
        throw new Error("Failed to post comment.")
    }
}));


/*  @desc       update/edit a comment
 *  @route      PUT /api/comments/:id
 *  @access     Private
 */
router.put("/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const data = req.body
    let comment = await Comments.findOne({where: { id: req.params.id, UserId: req.user.id, PostId: req.body.PostId }})
    if(comment){
        await comment.update({...comment, ...data})
        await comment.save();
        res.json(comment)
    } else {
        res.status(401)
        throw new Error("Not authorized.")
    }
}));

module.exports = router;