const Post = require("../models/Post");
const Tag = require("../models/Tag");

const createPost = async (req, res) => { 
    try {

        const {
            title,
            content,
            coverImage,
            tags,
            status
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({
                message: "Title is required"
            });
        }

        if (!content || !content.trim()) {
            return res.status(400).json({
                message: "Content is required"
            });
        }

        const postSlug = title
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const existingPost = await Post.findOne({
            slug: postSlug
        });

        if (existingPost) {
            return res.status(409).json({
                message: "A post with this title already exists"
            });
        }

        let validTags = [];

        if (tags && tags.length > 0) {

            validTags = await Tag.find({
                _id: { $in: tags }
            });

            if (validTags.length !== tags.length) {
                return res.status(400).json({
                    message: "One or more tags are invalid"
                });
            }
        }

        const post = await Post.create({
            title: title.trim(),
            slug: postSlug,
            content: content.trim(),
            coverImage: coverImage || "",
            author: req.userId,
            tags: validTags.map(tag => tag._id),
            status: status || "draft"
        });

        return res.status(201).json({
            message: "Post created successfully",
            post
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({
            status: "published"
        });

        return res.status(200).json({
            posts
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const post = await Post.findOne({
            slug,
            status: "published"
        })
        .populate("author" , "name email")
        .populate("tags" , "name slug");

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        return res.status(200).json({
            post
        })

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const getMyPosts = async (req, res) => {
    try {

        const { status } = req.query;

        const filter = {
            author: req.userId
        };

        if (status){
            if (status !== "draft" && status !== "published") {
                return res.status(400).json({
                    message: "Status must be Published or draft"
                });
            }
            filter.status = status;
        }


        const posts = await Post.find(filter)
        .populate("author", "name email")
        .populate("tags", "name slug")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            posts
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostBySlug,
    getMyPosts
};