const checkOnlineFriends = require("../utils/checkOnlineFriends");
const Users = require("../models/Users")
const UserData = require("../models/UserData")
const UserSockets = require("../models/UserSockets")
const { Op } = require('sequelize');


const chatHandlers = async (socket, myUserId) => {

    /* @desc  send-message
    *         triggers when a user sent a message. Message is then emitted to chatroom members sockets excluding current socket of sender
    */
   socket.on("send-message", async (data) => {
    const { users, ChatRoomId, messageData } = data;
    const socketsList = await findUserSockets( users, myUserId, socket.id)

    //emit message to chatmember sockets(other user's sockets included)
    if(socketsList.length !== 0 ) {
        let sender = { UserId: myUserId }
        if(socketsList.some(item => item.UserId !== myUserId)) {
            const User = await getUserData(myUserId)
            if(User) sender = {...sender, User}
        }
        socketsList.forEach(item => socket.to(item.socket).emit("receive-message", { sender, ChatRoomId, messageData }))
    }
   })


}

const findUserSockets = async( users, myUserId=null, excludeSocket=null) => {

  if(myUserId) users.push(myUserId)
  const result = await UserSockets.findAll({
    where: { UserId: {[Op.in]: users}, socket: {[Op.not]: excludeSocket}},
    raw: true
  })

  return result
}

const getUserData = async (id) => {
    const user = await Users.findByPk(id, {
        attributes: ['username', 'id'], 
        include: {
            model: UserData,
            attributes: ['firstName', 'lastName', 'image'],
            required: true
        },
    })
    if(user) return user
    return false;
}

module.exports = chatHandlers