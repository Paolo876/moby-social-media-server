const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

const UserStatus = sequelize.define('UserStatus', {
    socket: {
        type: DataTypes.STRING,
        allowNull: false,
    },
})

// const sync = async () => { 
//     await UserStatus.sync({ alter: true })
// }
// sync()


module.exports = UserStatus