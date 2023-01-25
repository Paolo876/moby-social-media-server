const express = require("express");
const router = express.Router();
const Comments = require("../models/Comments");
const Users = require("../models/Users");
const UserData = require("../models/UserData");
const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");


/*  @desc       create a new comment for a post
 *  @route      POST /api/comments/new-comment
 *  @access     Private
 */
router.post("/new-comment", cookieJwtAuth, asyncHandler( async (req, res) => {
    const { id } = await Comments.create({ ...req.body, UserId: req.user.id})
    const comment = await Comments.findByPk(id,{
        include: [{
            model: Users, 
            attributes: ['username', 'id'], 
            include: [{
                model: UserData,
                attributes: ['firstName', 'lastName', 'image']
            }]             
        }]
    })
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


/*  @desc       delete a comment
 *  @route      DELETE /api/comments/:id
 *  @access     Private
 */
router.delete("/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    let comment = await Comments.findOne({where: { id: req.params.id, UserId: req.user.id }})
    if(comment){
        await comment.destroy();
        res.json(req.params.id)
    } else {
        res.status(401)
        throw new Error("Not authorized.")
    }
}));

module.exports = router;