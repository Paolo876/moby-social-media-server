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


/*  @desc       Clear all user notifications
 *  @route      GET /api/notifications/
 *  @access     Private
 */
router.delete("/clear-all", cookieJwtAuth, asyncHandler( async (req, res) => {
    const UserId = req.user.id;
    await Notifications.destroy({ where: { UserId }})

    res.json({isCleared: true, UserId})
}));


/*  @desc       Delete a notification by id
 *  @route      GET /api/notifications/
 *  @access     Private
 */
router.delete("/delete/:id", cookieJwtAuth, asyncHandler( async (req, res) => {
    const UserId = req.user.id;
    const NotificationId = req.params.id
    await Notifications.destroy({ where: { UserId, NotificationId }})

    res.json({isDeleted: true, UserId, id})
}));


module.exports = router;