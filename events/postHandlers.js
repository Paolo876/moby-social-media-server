const UserSockets = require("../models/UserSockets")
const checkOnlineFriends = require("../utils/checkOnlineFriends");

const postHandlers = async (socket, UserId) => {


    /* @desc  emit created post to friends
    */
    socket.on('emit-created-post', async (data) => {
        const friendSockets = await checkOnlineFriends(UserId)   // [{socket}]
        friendSockets.forEach(item => socket.to(item.socket).emit("receive-created-post", data))
    });

    /* @desc  emit comment to post author
    */
}

module.exports = postHandlers