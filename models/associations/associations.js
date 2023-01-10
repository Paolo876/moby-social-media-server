const Users = require("../Users");
const UserData = require("../UserData");
const UserStatus = require("../UserStatus");
const Comments = require("../UserStatus");
const Posts = require("../Posts");
module.exports = () => {

    // user - userstatus
    Users.hasMany(UserStatus, { foreignKey: "UserId", onDelete: "CASCADE"});
    UserStatus.belongsTo(Users);

    //user - userdata
    Users.hasOne(UserData, { foreignKey: "UserId", onDelete: "CASCADE"});
    UserData.belongsTo(Users);

    //user friends
    Users.belongsToMany(Users, { as: "Friends", through: "friends"});
    Users.belongsToMany(Users, { as: 'Requestees', through: 'friendRequests', foreignKey: 'requesterId', onDelete: 'CASCADE'});
    Users.belongsToMany(Users, { as: 'Requesters', through: 'friendRequests', foreignKey: 'requesteeId', onDelete: 'CASCADE'});

    //comments - user | comments - posts
    Comments.belongsTo(Users);
    Comments.belongsTo(Posts);


    Posts.hasMany(Comments, { foreignKey: "PostId", onDelete: "CASCADE"});
    Posts.hasMany(models.Likes, { foreignKey: "PostId", onDelete: "cascade"});
    Posts.belongsTo(Users);
    Users.hasMany(Posts, { foreignKey: "UserId", onDelete: "CASCADE"});

}