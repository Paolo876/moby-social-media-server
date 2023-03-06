const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

const UserNotifications = sequelize.define('UserNotifications', {
    isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    // title: {
    //     type: DataTypes.STRING,
    //     allowNull: false,
    // },
    // type: {
    //     type: DataTypes.STRING,
    //     allowNull: false,
    // },
    // link: {
    //     type: DataTypes.STRING,
    //     allowNull: false,
    // },
    // content: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    // }
},
{
    freezeTableName: true,
    timestamps: false,
})


module.exports = UserNotifications