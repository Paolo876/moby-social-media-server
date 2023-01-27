const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

module.exports = sequelize.define("UserBio", {
    body: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    links: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
})