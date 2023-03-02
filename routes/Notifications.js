const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const UserData = require("../models/UserData")
const UserNotifications = require("../models/UserNotifications")

const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");



/*  @desc       Get all posts --paginated to 15 posts per request, most recent first.
 *  @route      GET /api/posts/
 *  @access     Private
 */
router.get("/", cookieJwtAuth, asyncHandler( async (req, res) => {
    const UserId = req.user.id;

    const notifications = await UserNotifications.findAll({
        where: { UserId },
        include: {
            model: Users,
            as: "ReferenceUser",
            attributes: ['username', 'id'], 
            include: [{
                model: UserData,
                attributes: ['firstName', 'lastName', 'image'],
            }]
        }
    })


    if(notifications){
        res.json(notifications)
    } else {
        res.status(401)
        throw new Error("Failed to fetch notifications.")
    }
}));
module.exports = router;