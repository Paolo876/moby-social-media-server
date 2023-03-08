const Posts = require("../models/Posts")

const findPostAuthor = async (id) => {
    const result = await Posts.findByPk(id, {
      attributes: ["UserId"],
      raw: true
    })
    return result.UserId;
}

module.exports = findPostAuthor;