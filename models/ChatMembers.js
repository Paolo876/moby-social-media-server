const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");

module.exports = sequelize.define('ChatMembers', {
    isLastMessageRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isArchived: { type: DataTypes.BOOLEAN, defaultValue: false },
})