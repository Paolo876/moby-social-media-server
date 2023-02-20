const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

const UserStatus = sequelize.define('UserStatus', {
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "online"
    }
}, {
    timestamps: false,
    
})


module.exports = UserStatus