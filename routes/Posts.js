const express = require("express");
const router = express.Router();
const Posts = require("../models/Posts");



/*  @desc       Get posts
 *  @route      POST /api/auth/login
 *  @access     Public
 */
router.get("/", asyncHandler( async (req, res) => {
    const pageSize = 15; // <--limit data fetched (pagination)


    const { username, password } = req.body;
    const user = await Users.findOne({ where: { username }, include: [{model: UserData}]});
    if(user && (await bcrypt.compare(password, user.password))){
        const { id, username, UserDatum } = user;
        const token = generateToken(id)
        res.cookie("token", token, { secure: true, sameSite: "none", path:"/", domain: process.env.NODE_ENV === "local" ? "localhost": ".paolobugarin.com", httpOnly: true }) //send the user id on token
        res.json({id, username, UserData: UserDatum})
    } else {
        res.status(401)
        throw new Error("Invalid email or password.")
    }
}));
module.exports = router;