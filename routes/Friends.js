const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const UserData = require("../models/UserData")
const { models } = require('../config/database');

// const Friends = require("../models/Friends")

const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");


/*  @desc       get user's friends
 *  @route      GET /api/friends/
 *  @access     Private
 */
router.get('/', cookieJwtAuth, asyncHandler(async (req, res) => {
    const friends = await models.friends.findAll({ where: { UserId: req.user.id}})
    res.json(friends)
}));

module.exports = router;
