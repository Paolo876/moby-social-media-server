const UserSockets = require("../models/UserSockets")
const checkOnlineFriends = require("../utils/checkOnlineFriends");

const postHandlers = async (socket, UserId) => {


    /* @desc  emit created post to friends
    */
    socket.on('emit-created-post', async (data) => {
        const friendSockets = await checkOnlineFriends(UserId)   // [{socket}]
        friendSockets.forEach(item => socket.to(item.socket).emit("receive-created-post", data))
    });

    /* @desc  emit commented post to author
    */
    socket.on('emit-commented-post', async (data) => {
        // AuthorId, PostId, spliced comment, User
        friendSockets.forEach(item => socket.to(item.socket).emit("receive-created-post", data))
    });


    /* @desc  emit liked post to author
    */
    socket.on('emit-liked-post', async (data) => {
        const friendSockets = await checkOnlineFriends(UserId)   // [{socket}]
        friendSockets.forEach(item => socket.to(item.socket).emit("receive-created-post", data))
    });
}

module.exports = postHandlers