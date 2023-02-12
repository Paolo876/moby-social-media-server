const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const UserData = require("../models/UserData")
const { models } = require('../config/database');


const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");


/*  @desc       get user's friends
 *  @route      GET /api/friends/
 *  @access     Private
 */
router.get('/', cookieJwtAuth, asyncHandler(async (req, res) => {
    const friends = await models.friends.findAll({ where: { UserId: req.user.id}})
    
    if(friends){
        res.json(friends)
    } else {
        res.status(401)
        throw new Error("Failed to fetch friends.")
    }
}));


/*  @desc       send/cancel friend request (if request exists, delete from db, else create)
 *  @route      GET /api/friends/friend-request/:FriendId
 *  @access     Private
 */
router.get('/friend-request/:FriendId', cookieJwtAuth, asyncHandler(async (req, res) => {
    const UserId = req.user.id;
    const FriendId = req.params.FriendId;

    const isRequestExisting = await models.friendRequests.findOne({ where: { UserId, FriendId}})    //check if request already exist
    const isAlreadyFriends = await models.friends.findOne({ where: { UserId, FriendId}})    //check if user-friend are already friends

    if(!isAlreadyFriends){
        if(isRequestExisting){
            //cancel/ delete friend request if exists.
            await isRequestExisting.destroy();
            res.json({isRequested: false, FriendId})
        } else {
            await models.friendRequests.create({ UserId, FriendId })
            const User = await Users.findByPk(FriendId, {
                attributes: ['username', 'id'], 
                include: [{
                    model: UserData,
                    attributes: ['firstName', 'lastName', 'image']
                }]
            })
            res.json({isRequested: true, FriendId, User})
        }
    } else {
        res.status(401)
        throw new Error("You are already friends with this user.")
    }

}));

module.exports = router;
