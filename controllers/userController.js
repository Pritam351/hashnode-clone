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
            email: user.email,
            bio: user.bio,
            avatarUrl: user.avatarUrl
        });

    } catch (error) {
        next(error);
    }
};

const getUserPosts = async (req, res, next) => {
    try {
        const { id } = req.params;

        const posts = await Post.find({
            author: id,
            status: "published"
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

const updateMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const { name, bio, avatarUrl } = req.body;

        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    message: "Name cannot be empty"
                });
            }

            user.name = name.trim();
        }

        if (bio !== undefined) {
            user.bio = bio;
        }

        if (avatarUrl !== undefined) {
            user.avatarUrl = avatarUrl;
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                bio: user.bio,
                avatarUrl: user.avatarUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserById,
    getUserPosts,
    updateMe
};
