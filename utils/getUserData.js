const Users = require("../models/Users")
const UserData = require("../models/UserData")

const getUserData = async (id) => {
    const user = await Users.findByPk(id, {
        attributes: ['username', 'id'], 
        include: {
            model: UserData,
            attributes: ['firstName', 'lastName', 'image'],
            required: true
        },
    })
    if(user) return user
    return false;
}

module.exports = getUserData;