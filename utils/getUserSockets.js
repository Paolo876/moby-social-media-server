const UserSockets = require("../models/UserSockets")

const getUserSockets = async (UserId) => {
  const sockets = await UserSockets.findAll({ where: { UserId }, attributes: ["socket"]})
  return sockets;
}

module.exports = getUserSockets;