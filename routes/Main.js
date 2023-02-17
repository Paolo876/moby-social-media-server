const express = require("express");
const router = express.Router();
const Users = require("../models/Users");
const UserData = require("../models/UserData");
const Posts = require("../models/Posts");
const sequelize = require('sequelize');

const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");


/*  @desc       Search
 *  @route      GET /api/main/search
 *  @access     Private
 */
router.get("/search", cookieJwtAuth, asyncHandler( async (req,res) => {
    const query = req.query.q;

    const users = await Users.findAll({
        attributes: ['username', 'id'], 
        include: {
            model: UserData,
            attributes: ['firstName', 'lastName', 'image'],
            required: true
        },
        where: {
            [sequelize.Op.or]: [
                { 'username': { [sequelize.Op.like]: '%' + query + '%' } },
                { '$UserDatum.firstName$': { [sequelize.Op.like]: '%' + query + '%' } },
                { '$UserDatum.lastName$': { [sequelize.Op.like]: '%' + query + '%' } },
            ],
        }
    })

    const posts = await Posts.findAll({
        include: [{
            model: Users,
            attributes: ['username', 'id'], 
            include: [{
                model: UserData,
                attributes: ['firstName', 'lastName', 'image'],
                required: true
            }]
        }],
        where: {
            [sequelize.Op.or]: [
                { 'title': { [sequelize.Op.like]: '%' + query + '%' } },
                // { '$UserDatum.firstName$': { [sequelize.Op.like]: '%' + query + '%' } },
                // { '$UserDatum.lastName$': { [sequelize.Op.like]: '%' + query + '%' } },
            ],
        }
    })
    res.json({users, posts})
}))

module.exports = router;