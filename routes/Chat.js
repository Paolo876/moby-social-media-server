const express = require("express");
const router = express.Router();
const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");

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

module.exports = router;

