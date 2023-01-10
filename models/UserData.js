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
        allowNull: false,
    },
    birthday: {
        type: DataTypes.STRING,
        allowNull: false,
    },
})

const sync = async () => { 
    await UserData.sync({ alter: true })
}
sync()


module.exports = UserData