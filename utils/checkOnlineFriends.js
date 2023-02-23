const Users = require("../models/Users")
const UserSockets = require("../models/UserSockets")
const { Op } = require('sequelize');


const checkOnlineFriends = async (UserId, includeSelf=false) => {
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
    let UserIds = user.map(item => item['Friends.id'])
    
    if(includeSelf) UserIds.push(UserId)

    const result = await UserSockets.findAll({
      where: { UserId: {[Op.in]: UserIds}},
      raw: true
    })
    return result
  }

  module.exports = checkOnlineFriends