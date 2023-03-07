const UserSockets = require("../models/UserSockets")
const { Op } = require('sequelize');


const findUserSockets = async( users, myUserId=null, excludeSocket=null) => {

  if(myUserId) users.push(myUserId)
  
  const result = await UserSockets.findAll({
    where: { UserId: {[Op.in]: users}, socket: {[Op.not]: excludeSocket}},
    raw: true
  })

  return result
}

module.exports = findUserSockets