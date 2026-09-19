const User = require("../models/user");
const Post = require("../models/Post");

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email
        });

    } catch (error) {
        next(error);
    }
};

const getUserPosts = async (req, res, next) => {
    try {
        const { id } = req.params;

        const posts = await Post.find({
            author: id
        })
            .populate("author", "name email")
            .populate("tags", "name slug")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: posts.length,
            posts
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserById,
    getUserPosts
};