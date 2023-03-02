const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

const UserNotifications = sequelize.define('UserNotifications', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false,
    },
},
{
    freezeTableName: true
})


module.exports = UserNotifications