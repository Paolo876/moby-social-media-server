const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

const UserData = sequelize.define('UserData', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    birthday: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    freezeTableName: true
})



module.exports = UserData