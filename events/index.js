
const jwt = require("jsonwebtoken");
const parseCookie = require("../utils/parseCookie")
const UserSockets = require("../models/UserSockets")
const Users = require("../models/Users")
const { Op } = require('sequelize');

const index = async (io, socket) => {

  /* @desc  get user data on login/authorization
  *         userId is saved on the httpcookie 'token'
  */
  socket.on('login', async () => {
      if(socket.request.headers.cookie && socket.request.headers.cookie !== "none"){
        const UserId = authorizeToken(socket.request.headers.cookie)
        console.log("HELLO")
        if(UserId){
          const isSocketExisting = await UserSockets.findByPk(socket.id)
          if(!isSocketExisting) {
            await UserSockets.create({socket: socket.id, UserId})
            const onlineFriends = await checkOnlineFriends(UserId)    // {socket, UserId}
            
            console.log(friends)
          }
        }
      }

  })


  /* @desc  disconnect/logout user
  *         triggers when a user logout or connection is closed
  */
  socket.on('disconnect', async () => {
    // console.log('user disconnected', socket.id);
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

//user's friends
const checkOnlineFriends = async (UserId) => {
  const user = await Users.findByPk(UserId, { attributes: [], 
    raw: true,
    plain: false, 
    nest: false,
    include: [
      {
      model: Users,
      as: "Friends",
      through: { attributes: []},
      attributes: ['id']
      }
    ]
  })
  const UserIds = user.map(item => item['Friends.id'])
  
  const result = await UserSockets.findAll({
    where: { UserId: {[Op.in]: UserIds}},
    raw: true
  })
  return result
}

module.exports = index;