const checkOnlineFriends = require("../utils/checkOnlineFriends");
const Users = require("../models/Users")
const UserSockets = require("../models/UserSockets")
const { Op } = require('sequelize');


const chatHandlers = async (socket, myUserId) => {

    /* @desc  disconnect/logout user
    *         triggers when a user logout or connection is closed
    */
   socket.on("send-message", async (data) => {
    const { users, ChatRoomId, message } = data;

    const sockets = await findUserSockets( users, myUserId, socket.id)
    console.log(sockets)
    //emit if sockets.length !== 0
   })
}

const findUserSockets = async( users, myUserId=null, excludeSocket=null) => {

  if(myUserId) users.push(myUserId)
  console.log(users)
  const result = await UserSockets.findAll({
    where: { UserId: {[Op.in]: users}, socket: {[Op.not]: excludeSocket}},
    raw: true
  })

  return result
}

module.exports = chatHandlers