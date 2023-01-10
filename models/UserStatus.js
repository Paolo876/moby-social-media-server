const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

const UserStatus = sequelize.define('UserStatus', {
    socket: {
        type: DataTypes.STRING,
        allowNull: false,
    },
})


module.exports = UserStatus