const Users = require("../Users");
const UserData = require("../UserData");
const UserStatus = require("../UserStatus");
const Comments = require("../UserStatus");
const Posts = require("../Posts");
const Likes = require("../Likes");

module.exports = () => {

    // user - userstatus
    Users.hasMany(UserStatus, { foreignKey: "UserId", onDelete: "CASCADE"});
    UserStatus.belongsTo(Users);

    //user - userdata
    Users.hasOne(UserData, { foreignKey: "UserId", onDelete: "CASCADE"});
    UserData.belongsTo(Users);

    //user friend
    Users.belongsToMany(Users, { as: "Friends", through: "friends"});
    Users.belongsToMany(Users, { as: 'Requestees', through: 'friendRequests', foreignKey: 'requesterId', onDelete: 'CASCADE'});
    Users.belongsToMany(Users, { as: 'Requesters', through: 'friendRequests', foreignKey: 'requesteeId', onDelete: 'CASCADE'});

    //comment - user | comment - post
    Comments.belongsTo(Users);
    Comments.belongsTo(Posts);

    //post - comment
    Posts.hasMany(Comments, { foreignKey: "PostId", onDelete: "CASCADE"});

    //post - like
    Posts.hasMany(Likes, { foreignKey: "PostId", onDelete: "CASCADE"});
    Likes.belongsTo(Posts, {foreignKey: "PostId", onDelete: "CASCADE"});
    //post - user
    Posts.belongsTo(Users);
    Users.hasMany(Posts, { foreignKey: "UserId", onDelete: "CASCADE"});
    
}