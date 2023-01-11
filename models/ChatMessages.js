const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

module.exports = sequelize.define('ChatMessages', {
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    media: {
        type: DataTypes.STRING,
        allowNull: true,
    }
})