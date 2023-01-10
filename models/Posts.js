const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

module.exports = sequelize.define("Posts", {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    postText: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    }
})