const express = require("express");
const router = express.Router();
const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");
const { literal, Op } = require("sequelize");

const ChatRoom = require("../models/ChatRoom")
const ChatMessages = require("../models/ChatMessages")
const ChatMembers = require("../models/ChatMembers")
const Users = require("../models/Users")
const UserData = require("../models/UserData")


/*  @desc       Get all user's chatrooms
 *  @route      GET /api/chat/
 *  @access     Private
 */
router.get("/", cookieJwtAuth, asyncHandler( async (req, res) => {
    const chatRooms = await ChatMembers.findAll({
        where: { UserId: req.user.id },
        attributes: [],
        order: [[ ChatRoom, 'updatedAt', 'DESC' ]], 
        include: [{
            model: ChatRoom,
            attributes: ["id"],
            include: {
                model: ChatMessages,
                limit: 1,
                order: [['createdAt', 'DESC']],
                include: [{
                    model: Users, 
                    attributes: ['username', 'id'], 
                    include: [{
                        model: UserData,
                        attributes: ['firstName', 'lastName', 'image']
                    }],
                }]
            }
        }],
    })

    if(chatRooms){
        const result = chatRooms.sort((a, b) => {
            if(a.ChatRoom.ChatMessages[0] && b.ChatRoom.ChatMessages[0]) return new Date(b.ChatRoom.ChatMessages[0].createdAt) - new Date(a.ChatRoom.ChatMessages[0].createdAt);
        })

        res.json(result)
    } else {
        res.status(401)
        throw new Error("Failed to fetch data.")
    }
}));


/*  @desc       Get chatMessages by id
 *  @route      GET /api/chat/:id
 *  @access     Private
 */
router.get("/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const ChatRoomId = req.params.id;
    const UserId = req.user.id
    //check if user is a member of chatRoom
    const isMember = await ChatMembers.findOne({where: {ChatRoomId, UserId }})

    if(isMember){
        const chatRoom = await ChatRoom.findByPk(ChatRoomId, {
            attributes: ['id'],
            order: [[ChatMessages, 'createdAt', 'DESC']],
            include: [{
                model: ChatMessages,
                attributes: { exclude: ["ChatRoomId"]}, 
            },{
                model: ChatMembers,
                attributes: ["id"],
                include: [{
                    model: Users, 
                    attributes: ['username', 'id'], 
                    include: [{
                        model: UserData,
                        attributes: ['firstName', 'lastName', 'image']
                    }],
                }]
            }]
        })
        if(chatRoom){
            res.json(chatRoom)
        } else {
            res.status(401)
            throw new Error("Failed to fetch data.")
        }    
    } else {
        res.status(401)
        throw new Error("Not authorized.")
    }
}));


/*  @desc       Search for chatRooms between user and receipient (Private chat -limited to user and receiver on chatroom only)
 *  @route      POST /api/chat/search/:id
 *  @access     Private
 */
router.get("/search/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const UserId = req.user.id;
    const FriendId = req.params.id;
    const isChatRoomAvailable = await ChatMembers.findOne({
        where : { UserId: [ UserId, FriendId ] }, //where UserId is either UserId/FriendId
        group: "ChatRoomId", 
        having: literal(`count(*) = 2`),
        attributes: ["ChatRoomId"]
    });

    if(isChatRoomAvailable){
        res.json(isChatRoomAvailable)
    } else {
        res.json({ChatRoomId: null})
    }

}));


// /*  @desc       Send a message (creates a new chatRoom if no chatRoom exists between sender and receipient)
//  *  @route      POST /api/chat/
//  *  @access     Private
//  */
// router.post("/", cookieJwtAuth, asyncHandler( async (req, res) => {
//     const UserId = req.user.id;

// }));

module.exports = router;

