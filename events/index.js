
const jwt = require("jsonwebtoken");
const parseCookie = require("../utils/parseCookie")


const index = (io, socket) => {

    // //authorize token if exists
    // if(socket.request.headers.cookie){
    //     console.log(socket.request.headers.cookie)
    //     const userId = authorizeToken(socket.request.headers.cookie)
    //     console.log(userId)
    // }

    //listen to login
    socket.on('login', () => {
        // console.log(socket.handshake.headers.cookie)
        const userId = authorizeToken(socket.request.headers.cookie)
        console.log("logged in", userId)
    })

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });


}

const authorizeToken = (cookie) => {
    const token = parseCookie(cookie).token
    const user = jwt.verify(token, process.env.JWT_SECRET);    
    return user.id;
}

module.exports = index;