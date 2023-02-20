
const jwt = require("jsonwebtoken");
const parseCookie = require("../utils/parseCookie")
const UserSockets = require("../models/UserSockets")

const index = async (io, socket) => {

  /* @desc  get user data on login/authorization
  *         userId is saved on the httpcookie 'token'
  */
  socket.on('login', async () => {
      if(socket.request.headers.cookie && socket.request.headers.cookie !== "none"){
        const UserId = authorizeToken(socket.request.headers.cookie)

        if(UserId){
          const isSocketExisting = await UserSockets.findByPk(socket.id)
          if(!isSocketExisting) {
            await UserSockets.create({socket: socket.id, UserId})
          }
  
        }
      }

  })


  /* @desc  disconnect/logout user
  *         triggers when a user logout or connection is closed
  */
  socket.on('disconnect', async () => {
    console.log('user disconnected', socket.id);
    const isSocketExisting = await UserSockets.findByPk(socket.id)

    if(isSocketExisting) {
      await isSocketExisting.destroy();
    }
  });

}


//decode cookies
const authorizeToken = (cookie) => {
    const token = parseCookie(cookie).token
    if(token){
      const user = jwt.verify(token, process.env.JWT_SECRET);    
      return user.id;
    }
    return false;
}

module.exports = index;