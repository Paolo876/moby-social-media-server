const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const UserData = require("../models/UserData")
const Notifications = require("../models/Notifications")

const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");



/*  @desc       Get all user notifications
 *  @route      GET /api/notifications/
 *  @access     Private
 */
router.get("/", cookieJwtAuth, asyncHandler( async (req, res) => {
    const UserId = req.user.id;

    const notifications = await Notifications.findAll({
        where: { UserId },
        order: [['isRead', 'ASC'],[ 'updatedAt', 'DESC' ]], 
        include: {
            model: Users,
            as: "ReferenceUser",
            attributes: ['username', 'id'], 
            include: {
                model: UserData,
                attributes: ['firstName', 'lastName', 'image'],
            }
        }
        
    })

    if(notifications){
        res.json(notifications)
    } else {
        res.status(401)
        throw new Error("Failed to fetch notifications.")
    }
}));


/*  @desc       set isRead property to true
 *  @route      GET /api/notifications/:id
 *  @access     Private
 */
router.get("/read/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const UserId = req.user.id;
    const id = req.params.id
    
    await Notifications.update({isRead: true}, { where: { id, UserId }})

    res.json({isRead: true, id, UserId})
}));


/*  @desc       Clear all user notifications
 *  @route      DELETE /api/notifications/clear-all
 *  @access     Private
 */
router.delete("/clear-all", cookieJwtAuth, asyncHandler( async (req, res) => {
    const UserId = req.user.id;
    await Notifications.destroy({ where: { UserId }})

    res.json({isCleared: true, UserId})
}));


/*  @desc       Mark all notifications as read
 *  @route      GET /api/notifications/read-all
 *  @access     Private
 */
router.get("/read-all", cookieJwtAuth, asyncHandler( async (req, res) => {
    const UserId = req.user.id;
    await Notifications.update({ isRead: true },{ where: { UserId }})
    res.json({isAllRead: true, UserId})
}));


/*  @desc       Delete a notification by id
 *  @route      DELETE /api/notifications/delete/:id
 *  @access     Private
 */
router.delete("/delete/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const UserId = req.user.id;
    const NotificationId = req.params.id
    await Notifications.destroy({ where: { UserId, NotificationId }})

    res.json({isDeleted: true, UserId, id})
}));


module.exports = router;