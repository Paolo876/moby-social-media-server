const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const UserStatus = require("./UserStatus");
const UserData = require("./UserData");
// const Friends = require("./Friends");

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
        }
    },   
})

/* associations */
Users.hasMany(UserStatus, { foreignKey: "UserId", onDelete: "cascade"});
UserStatus.belongsTo(Users);
Users.hasOne(UserData, { foreignKey: "UserId", onDelete: "cascade"});
UserData.belongsTo(Users);

//friends assoc
Users.belongsToMany(Users, { as: "Friends", through: "friends"});
Users.belongsToMany(Users, { as: 'Requestees', through: 'friendRequests', foreignKey: 'requesterId', onDelete: 'CASCADE'});
Users.belongsToMany(Users, { as: 'Requesters', through: 'friendRequests', foreignKey: 'requesteeId', onDelete: 'CASCADE'});

module.exports = Users