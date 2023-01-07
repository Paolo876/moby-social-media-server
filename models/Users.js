const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require("../config/database");

const Users = sequelize.define('Users', {
    username: {
    type: DataTypes.STRING,
    allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userInformation: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    isLoggedIn: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
    userStatus: {
        type: DataTypes.STRING,
        defaultValue: "offline",
        allowNull: false,
    }
})

const sync = async () => {
    await Users.sync({ alter: true })
}
sync()


module.exports = Users