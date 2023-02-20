
const jwt = require("jsonwebtoken");
const parseCookie = require("../utils/parseCookie")


const index = (io, socket) => {

  /* @desc  get user data on login/authorization
  *         userId is saved on the httpcookie 'token'
  */
  socket.on('login', () => {
      console.log("COOKIE", socket.request.headers.cookie)
      const userId = authorizeToken(socket.request.headers.cookie)
      console.log("logged in", userId, socket.id)
  })


  /* @desc  disconnect/logout user
  *         triggers when a user logout or connection is closed
  */
  socket.on('disconnect', () => {
    console.log('user disconnected', socket.id);
  });

}


//decode cookies
const authorizeToken = (cookie) => {
    const token = parseCookie(cookie).token
    const user = jwt.verify(token, process.env.JWT_SECRET);    
    return user.id;
}

module.exports = index;