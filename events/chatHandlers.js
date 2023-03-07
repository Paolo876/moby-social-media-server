const findUserSockets = require("../utils/findUserSockets")
const getUserData = require("../utils/getUserData")

const chatHandlers = async (socket, myUserId) => {

    /* @desc  send-message
    *         triggers when a user sent a message. Message is then emitted to chatroom members sockets excluding current socket of sender
    */
   socket.on("send-message", async (data) => {
    const { users, ChatRoomId, messageData, isNew=false } = data;
    const socketsList = await findUserSockets( users, myUserId, socket.id)

    //emit message to chatmember sockets(other user's sockets included)
    if(socketsList.length !== 0 ) {
        let sender = { UserId: myUserId }
        if(socketsList.some(item => item.UserId !== myUserId)) {
            const User = await getUserData(myUserId)
            if(User) sender = {...sender, User}
        }
        socketsList.forEach(item => socket.to(item.socket).emit("receive-message", { sender, ChatRoomId, messageData, isNew }))
    }
   })

}


module.exports = chatHandlers