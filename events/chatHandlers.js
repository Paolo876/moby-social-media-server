const checkOnlineFriends = require("../utils/checkOnlineFriends");
const Users = require("../models/Users")
const UserSockets = require("../models/UserSockets")
const { Op } = require('sequelize');


const chatHandlers = async (socket, myUserId) => {

    /* @desc  send-message
    *         triggers when a user sent a message. Message is then emitted to chatroom members sockets excluding current socket of sender
    */
   socket.on("send-message", async (data) => {
    const { users, ChatRoomId, message } = data;
    const socketsList = await findUserSockets( users, myUserId, socket.id)

    //emit message to chatmember sockets(other user's sockets included)
    if(socketsList.length !== 0 ) socketsList.forEach(item => socket.to(item.socket).emit("receive-message", { senderId: myUserId, ChatRoomId, message }))
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

module.exports = chatHandlers