const Users = require("../Users");
const UserData = require("../UserData");
const UserStatus = require("../UserStatus");
const UserSockets = require("../UserSockets");
const UserNotifications = require("../UserNotifications");
const UserBio = require("../UserBio");
const Comments = require("../Comments");
const Posts = require("../Posts");
const Likes = require("../Likes");
const ChatRoom = require("../ChatRoom");
const ChatMessages = require("../ChatMessages");
const ChatMembers = require("../ChatMembers");
const Bookmarks = require("../Bookmarks");

module.exports = () => {

    // user - userstatus
    Users.hasOne(UserStatus, { foreignKey: "UserId", onDelete: "CASCADE"});
    UserStatus.belongsTo(Users);

    // user - userstatus
    Users.hasMany(UserSockets, { foreignKey: "UserId", onDelete: "CASCADE"});
    UserSockets.belongsTo(Users);

    // user - UserNotifications
    Users.hasMany(UserNotifications, { foreignKey: "UserId", onDelete: "CASCADE"});
    UserNotifications.belongsTo(Users);

    //user - userdata
    Users.hasOne(UserData, { foreignKey: "UserId", onDelete: "CASCADE"});
    UserData.belongsTo(Users);

    //user - userbio
    Users.hasOne(UserBio, { foreignKey: "UserId", onDelete: "CASCADE"});
    UserBio.belongsTo(Users);

    //user friend
    Users.belongsToMany(Users, { as: "Friends", through: "friends"});
    Users.belongsToMany(Users, { as: 'Requestees', through: 'friendRequests', foreignKey: 'UserId', onDelete: 'CASCADE'});      // <-- UserId refers to requester
    Users.belongsToMany(Users, { as: 'Requesters', through: 'friendRequests', foreignKey: 'FriendId', onDelete: 'CASCADE'});    // <-- FriendId refers to requestee

    //comment - user | comment - post
    Comments.belongsTo(Users);
    Users.hasMany(Comments, {foreignKey: "UserId", onDelete: "CASCADE"});

    //post - comment
    Posts.hasMany(Comments, { foreignKey: "PostId", onDelete: "CASCADE"});
    Comments.belongsTo(Posts);

    //post - like
    Posts.hasMany(Likes, { foreignKey: "PostId", onDelete: "CASCADE"});
    Likes.belongsTo(Posts);
    
    //like - user
    Users.hasMany(Likes, {foreignKey: "UserId", onDelete: "CASCADE"});
    Likes.belongsTo(Users);

    //post - user
    Posts.belongsTo(Users);
    Users.hasMany(Posts, { foreignKey: "UserId", onDelete: "CASCADE"});
    
    //chatroom - user
    ChatRoom.belongsToMany(Users, {as: "members", through: "ChatMembers" });

    //chatroom - chatmember
    ChatRoom.hasMany(ChatMembers, { as: "ChatMembers", foreignKey: "ChatRoomId",onDelete: "CASCADE" });
    ChatRoom.hasMany(ChatMembers, { as: "isLastMessageRead", foreignKey: "ChatRoomId",onDelete: "CASCADE" });
    ChatMembers.belongsTo(ChatRoom, { foreignKey: "ChatRoomId", onDelete: "CASCADE"});
    // ChatRoom.hasMany(ChatMembers, { foreignKey: "UserId",onDelete: "CASCADE" })

    //chatmessage - user
    ChatMessages.belongsTo(Users);
    Users.hasMany(ChatMessages, { foreignKey: "UserId", onDelete: "CASCADE" })

    //chatmessage - chatroom
    ChatMessages.belongsTo(ChatRoom, { foreignKey: "ChatRoomId", onDelete: "CASCADE"});
    ChatRoom.hasMany(ChatMessages, { foreignKey: "ChatRoomId", onDelete: "CASCADE" });

    //chatmember - user
    ChatMembers.belongsTo(Users);
    Users.hasMany(ChatMembers, { foreignKey: "UserId",onDelete: "cascade" });

    //bookmarks - user
    Users.hasMany(Bookmarks, {foreignKey: "UserId", onDelete: "CASCADE"});
    Bookmarks.belongsTo(Users);

    //bookmarks - post
    Posts.hasMany(Bookmarks, {foreignKey: "PostId", onDelete: "CASCADE"});
    Bookmarks.belongsTo(Posts);

}