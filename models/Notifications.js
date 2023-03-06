const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

const Notifications = sequelize.define('Notifications', {
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
    // isRead: {
    //     type: DataTypes.BOOLEAN,
    //     allowNull: false,
    //     defaultValue: false,
    // },
    content: {
        type: DataTypes.STRING,
        allowNull: true,
    }
},
{
    freezeTableName: true
})


module.exports = Notifications