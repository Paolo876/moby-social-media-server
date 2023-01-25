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
    const comment = await Comments.create({ ...req.body, UserId: req.user.id})
    if(comment){
        res.json(comment)
    } else {
        res.status(401)
        throw new Error("Failed to post comment.")
    }
}));

module.exports = router;