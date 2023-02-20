const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

const UserSockets = sequelize.define('UserSockets', {
    socket: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
    }
},
{
    timestamps: false
})


module.exports = UserSockets