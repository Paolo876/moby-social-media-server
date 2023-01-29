const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

module.exports = sequelize.define("UserBio", {
    body: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    links: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
})