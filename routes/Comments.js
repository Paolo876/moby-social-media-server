const express = require("express");
const router = express.Router();
const Comments = require("../models/Comments");

const cookieJwtAuth = require("../middlewares/cookieJwtAuth");
const asyncHandler = require("express-async-handler");


/*  @desc       new comment
 *  @route      POST /api/comments/new-comment
 *  @access     Private
 */
router.post("/new-comment", cookieJwtAuth, asyncHandler( async (req, res) => {
    // const { id } = await Comments.create({ ...req.body, UserId: req.user.id})

}));

module.exports = router;