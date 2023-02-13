const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const UserData = require("../models/UserData")
const { models } = require('../config/database');


const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");


/*  @desc       get user's friends and friend requests
 *  @route      GET /api/friends/
 *  @access     Private
 */
router.get('/', cookieJwtAuth, asyncHandler(async (req, res) => {
    const user = await Users.findByPk(req.user.id, {
        attributes: [], 
        include: [
            {
                model: Users,
                as: "Friends",
                through: { attributes: []},
                attributes: ['username', 'id'], 
                include: [{
                    model: UserData,
                    attributes: ['firstName', 'lastName', 'image'],
                }]
            },{
                model: Users,
                as: "Requesters",
                through: { attributes: []},
                attributes: ['username', 'id'], 
                include: [{
                    model: UserData,
                    attributes: ['firstName', 'lastName', 'image'],
                }]
            },{
                model: Users,
                as: "Requestees",
                through: { attributes: []},
                attributes: ['username', 'id'], 
                include: [{
                    model: UserData,
                    attributes: ['firstName', 'lastName', 'image'],
                }]
            }
        ]
    })

    if(user){
        res.json(user)
    } else {
        res.status(401)
        throw new Error("Failed to fetch friends.")
    }
}));


/*  @desc       send/cancel friend request (if request exists, delete from db, else create)
 *  @route      GET /api/friends/send-request/:FriendId
 *  @access     Private
 */
router.get('/send-request/:FriendId', cookieJwtAuth, asyncHandler(async (req, res) => {
    const UserId = req.user.id;
    const FriendId = req.params.FriendId;

    const isRequestExisting = await models.friendRequests.findOne({ where: { UserId, FriendId}})    //check if request already exist
    const isFriendSentRequest = await models.friendRequests.findOne({ where: { UserId: FriendId, FriendId: UserId}})    //check if friend already sent request
    const isAlreadyFriends = await models.friends.findOne({ where: { UserId, FriendId}})    //check if user-friend are already friends

    if(!isAlreadyFriends){
        if(isFriendSentRequest){
            //confirm friends
            await isFriendSentRequest.destroy();
            await models.friends.create({ UserId, FriendId})
            await models.friends.create({ UserId: FriendId, FriendId: UserId})
            res.json({isFriends: true, FriendId})
        }

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
        if(isRequestExisting) await isRequestExisting.destroy();        //  cancel/delete friend request if exists.
        if(isFriendSentRequest) await isFriendSentRequest.destroy();
        res.status(401)
        throw new Error("You are already friends with this user.")
    }
}));


/*  @desc       confirm or decline friend request (if request exists, delete from db and create friends row, else delete friend request)
 *  @route      GET /api/friends/confirm-request/:FriendId
 *  @access     Private
 */
router.post('/confirm-request/:FriendId', cookieJwtAuth, asyncHandler(async (req, res) => {
    const UserId = req.user.id;
    const FriendId = req.params.FriendId;
    const isConfirmed = req.body.isConfirmed;
    const isRequestExisting = await models.friendRequests.findOne({ where: { UserId: FriendId, FriendId: UserId}})    //check if request already exist
    const isAlreadyFriends = await models.friends.findOne({ where: { UserId, FriendId}})    //check if user-friend are already friends

    if(!isAlreadyFriends){
        if(isRequestExisting) {
            if(isConfirmed){
                //add as friend
                await models.friends.create({ UserId, FriendId})
                await models.friends.create({ UserId: FriendId, FriendId: UserId})
                await isRequestExisting.destroy();
                res.json({isConfirmed, FriendId})
            } else {
                //delete request
                await isRequestExisting.destroy();
                res.json({isConfirmed, FriendId})
            }

        } else {
            res.status(401)
            throw new Error("Friend request not found.")
        }
    } else {
        if(isRequestExisting) {
            await isRequestExisting.destroy()
        }
        res.status(401)
        throw new Error("You are already friends with this user.")
    }
}));


/*  @desc       unfriend user
 *  @route      GET /api/friends/unfriend/:FriendId
 *  @access     Private
 */
router.get('/unfriend/:FriendId', cookieJwtAuth, asyncHandler(async (req, res) => {
    const UserId = req.user.id;
    const FriendId = req.params.FriendId;

    const isFriends = await models.friends.findOne({ where: { UserId , FriendId}})    //check if user-friend are friends

    if(isFriends){
        await isFriends.destroy();
        await models.friends.destroy({where: {UserId: FriendId , FriendId: UserId}})
        res.json({isFriends: false, FriendId})
    } else {
        res.status(401)
        throw new Error("You are not friends with this user.")
    }
    
}));

module.exports = router;
