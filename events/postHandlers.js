const postHandlers = async (socket, UserId) => {


    /* @desc  emit created post to friends
    */
    // socket.on('send-friend-request', async (data) => {
    //     const friendSockets = await getUserSockets(data.requesteeId)   // [{socket}]
    //     friendSockets.forEach(item => socket.to(item.socket).emit("receive-friend-request", data.requestData))
    // });

    /* @desc  emit comment to post author
    */
}

module.exports = postHandlers