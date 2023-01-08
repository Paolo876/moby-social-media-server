const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

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
}, {
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);

                // const hash = await bcrypt.hashSync(user.password, salt);
                // user.password = hash;
                // this.password = await bcrypt.hash(this.password, salt)
                // const salt = await bcrypt.genSaltSync(10, 'a');
                // user.password = bcrypt.hashSync(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.password) {
                // const salt = await bcrypt.genSaltSync(10, 'a');
                // user.password = bcrypt.hashSync(user.password, salt);
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);

                // const hash = bcrypt.hashSync(user.password, salt);
                // user.password = hash;
            }
        }
    },   
})

const sync = async () => {
    await Users.sync({ alter: true })
}
sync()


module.exports = Users