const express = require("express");
const router = express.Router();
const Comments = require("../models/Comments");
const Users = require("../models/Users");
const UserData = require("../models/UserData");
const Notifications = require("../models/Notifications");
const Posts = require("../models/Posts");
const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");


/*  @desc       create a new comment for a post
 *  @route      POST /api/comments/new-comment
 *  @access     Private
 */
router.post("/new-comment", cookieJwtAuth, asyncHandler( async (req, res) => {
    const PostId = req.body.PostId;
    const UserId = req.user.id;

    //check if post exists
    const post = await Posts.findByPk(PostId);
    if(post){
        const { id } = await Comments.create({ ...req.body, UserId})
        const comment = await Comments.findByPk(id,{
            raw: true,
            nest: true,
            include: [{
                model: Users, 
                attributes: ['username', 'id'], 
                include: [{
                    model: UserData,
                    attributes: ['firstName', 'lastName', 'image']
                }]             
            }],
        })
        if(comment){
            //notify author
            if(parseInt(UserId) !== parseInt(post.UserId)) {
                const data = {type: "comment", link: `/posts/${PostId}`, ReferenceUserId: UserId, UserId: post.UserId}
                //if notification already exist, update isRead to false.
                let existingNotif = await Notifications.findOne({ where: data })
                if(existingNotif){
                    existingNotif.changed('updatedAt', true)
                    await existingNotif.update({ isRead: false, updatedAt: new Date() })
                    await existingNotif.save({ silent: true});
                } else {
                    existingNotif = await Notifications.create(data)
                }
                comment.notificationId = existingNotif.id;
            }
            res.json(comment)

        } else {
            res.status(401)
            throw new Error("Failed to post comment.")
        }    
    } else {
        res.status(401)
        throw new Error("Post not found.")

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