const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

const Notifications = sequelize.define('Notifications', {
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    link: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    ReferenceId: {      //id of post or message etc...
        type: DataTypes.INTEGER,
        allowNull: false,
    }
},
{
    freezeTableName: true
})


module.exports = Notifications