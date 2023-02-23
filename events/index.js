
const jwt = require("jsonwebtoken");
const parseCookie = require("../utils/parseCookie")
const UserSockets = require("../models/UserSockets")
const UserStatus = require("../models/UserStatus")
const checkOnlineFriends = require("../utils/checkOnlineFriends")

const index = async (io, socket) => {

  /* @desc  get user data on login/authorization (if connection has a cookie/token, a user is logged in)
  *         userId is saved on the httpcookie 'token'
  */
  if(socket.request.headers.cookie && socket.request.headers.cookie !== "token=none"){
    const UserId = authorizeToken(socket.request.headers.cookie)
    if(UserId){
      const isSocketExisting = await UserSockets.findByPk(socket.id)
      const isUserAlreadyLoggedIn = await UserSockets.findOne({where: { UserId }})
      if(!isSocketExisting) {
        await UserSockets.create({socket: socket.id, UserId})
        const onlineFriends = await checkOnlineFriends(UserId)    // {socket, UserId}

        //emit online friends to user
        socket.emit("online-friends", [...new Set(onlineFriends.map(item => item.UserId))])     //duplicated UserId entries are removed with Set() method
        
        //emit userId to friends' sockets
        if(!isUserAlreadyLoggedIn) {
          const { status } = await UserStatus.findOne({ where: {UserId}, attributes: ["status"]})
          onlineFriends.forEach(item => socket.to(item.socket).emit("logged-in-friend", { UserId, status }))
        }
      }


      /* @desc  on statusChange
      *         triggers when a user changes status
      */
      socket.on('status-change', async (data) => {
        const onlineFriends = await checkOnlineFriends(UserId)    // {socket, UserId}
        onlineFriends.forEach(item => socket.to(item.socket).emit("status-changed-friend", {status: data, UserId}))   //emit logout to online friends
      });

      

      /* @desc  disconnect/logout user
      *         triggers when a user logout or connection is closed
      */
      socket.on('disconnect' || 'logout', async () => {
        const isSocketExisting = await UserSockets.findByPk(socket.id)
        if(isSocketExisting) {
          await isSocketExisting.destroy();
          const isUserDisconnected = await UserSockets.findAll({where: {UserId}})     //no more connections from the user
          if(isUserDisconnected.length === 0) {
            const onlineFriends = await checkOnlineFriends(UserId)    // {socket, UserId}
            onlineFriends.forEach(item => socket.to(item.socket).emit("logged-out-friend", UserId))   //emit logout to online friends
          }
        }  
      });


      //require chat handlers
      await require("./chatHandlers")(socket, UserId)
    }
  }
}


//decode cookies
const authorizeToken = (cookie) => {
    const token = parseCookie(cookie).token
    try {
      if(token){
        const user = jwt.verify(token, process.env.JWT_SECRET);    
        return user.id;
      }
    } catch(err) {
      return false
    }
    return false;
}


module.exports = index;