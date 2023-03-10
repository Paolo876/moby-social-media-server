const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");
const UserStatus = require("./UserStatus");


const Users = sequelize.define('Users', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        afterCreate: async (user) => {
            await UserStatus.create({ UserId: user.id})
        }
    },   
})

module.exports = Users