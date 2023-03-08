const UserSockets = require("../models/UserSockets")
const Posts = require("../models/Posts")
const checkOnlineFriends = require("../utils/checkOnlineFriends");
const findUserSockets = require("../utils/findUserSOckets");

const postHandlers = async (socket, UserId) => {


    /* @desc  emit created post to friends
    */
    socket.on('emit-created-post', async (data) => {
        const friendSockets = await checkOnlineFriends(UserId)   // [{socket}]
        friendSockets.forEach(item => socket.to(item.socket).emit("receive-created-post", data))
    });

    /* @desc  emit commented post to author
    */
    socket.on('emit-comment', async (data) => {
        // AuthorId, PostId, spliced comment, User
        const authorSockets = await findUserSockets([data.AuthorId])
        authorSockets.forEach(item => socket.to(item.socket).emit("receive-comment", data))
    });


    /* @desc  emit liked post to author
    */
    socket.on('emit-like', async (data) => {
        // PostId, User, IsLiked
        const AuthorId = await findPostAuthor(data.PostId)
        const authorSockets = await findUserSockets([AuthorId])
        authorSockets.forEach(item => socket.to(item.socket).emit("receive-like", data))

    });
}

const findPostAuthor = async (id) => {
  const result = await Posts.findByPk(id, {
    attributes: ["UserId"],
    raw: true
  })
  return result.UserId;
}

module.exports = postHandlers