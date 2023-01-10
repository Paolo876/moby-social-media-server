const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

module.exports = sequelize.define("Comments", {
    comment: {
        type: DataTypes.STRING,
        allowNull: false,
    }
})