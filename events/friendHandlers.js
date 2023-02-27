const UserSockets = require("../models/UserSockets")
const getUserSockets = require("../utils/getUserSockets")

const friendHandlers = async (socket, UserId) => {


    /* @desc  emit friend request 
    *         triggers when a user changes status
    */
    socket.on('send-friend-request', async (data) => {
        const friendSockets = await getUserSockets(data.requesteeId)   // [{socket}]
        friendSockets.forEach(item => socket.to(item.socket).emit("receive-friend-request", data.requestData))
    });

}

module.exports = friendHandlers