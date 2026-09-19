const Post = require("../models/Post");
const Tag = require("../models/Tag");

const createPost = async (req, res, next) => {
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
        next(error);
    }
};

const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find({
            status: "published"
        });

        return res.status(200).json({
            posts
        });

    } catch (error) {
        next(error);
    }
};

const getPostBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const post = await Post.findOne({
            slug,
            status: "published"
        })
            .populate("author", "name email")
            .populate("tags", "name slug");

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        return res.status(200).json({
            post
        })

    } catch (error) {
        next(error);
    }
};

const getMyPosts = async (req, res) => {
    try {

        const { status } = req.query;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (page < 1 || limit < 1) {
            return res.status(400).json({
                message: " page and limit must be grate than 0"
            });
        }

        const filter = {
            author: req.userId
        };

        if (status) {
            if (status !== "draft" && status !== "published") {
                return res.status(400).json({
                    message: "Status must be Published or draft"
                });
            }
            filter.status = status;
        }

        const skip = (page - 1) * limit;

        const posts = await Post.find(filter)
            .populate("author", "name email")
            .populate("tags", "name slug")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPosts = await Post.countDocuments(filter);
        const totalPages = Math.ceil(totalPosts / limit);

        return res.status(200).json({
            posts,
            pagination: {
                currentPage: page,
                limit,
                totalPosts,
                totalPages
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const updatePost = async (req, res, next) => {
    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.author.toString() !== req.userId) {
            return res.status(403).json({
                message: "You are not allowed to update this post"
            });
        }

        const {
            title,
            content,
            tags,
            status
        } = req.body;

        if (title !== undefined && !title.trim()) {
            return res.status(400).json({
                message: "Title cannot be empty"
            });
        }

        if (content !== undefined && !content.trim()) {
            return res.status(400).json({
                message: "Content cannot be empty"
            });
        }
        if (
            status !== undefined &&
            status !== "published" &&
            status !== "draft"
        ) {
            return res.status(400).json({
                message: "Status must be published or draft"
            });
        }

        let validTags = [];

        if (tags !== undefined) {

            if (!Array.isArray(tags)) {
                return res.status(400).json({
                    message: "Tags must be an array"
                });
            }

            if (tags.length > 0) {

                validTags = await Tag.find({
                    _id: { $in: tags }
                });

                if (validTags.length !== tags.length) {
                    return res.status(400).json({
                        message: "One or more tags are invalid"
                    });
                }
            }
        }

        if (title !== undefined) {
            post.title = title.trim();
        }

        if (content !== undefined) {
            post.content = content.trim();
        }

        if (status !== undefined) {
            post.status = status;
        }

        if (tags !== undefined) {
            post.tags = tags;
        }

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate("author", "name email")
            .populate("tags", "name slug");

        return res.status(200).json({
            message: "Post updated successfully",
            post: updatedPost
        });

    } catch (error) {
        next(error);
    }
};

const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        if (post.author.toString() !== req.userId) {
            return res.status(403).json({
                message: "You are not allowed to delete this post"
            });
        }

        await post.deleteOne();

        return res.status(200).json({
            message: "Post deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPost,
    getPosts,
    getPostBySlug,
    getMyPosts,
    updatePost,
    deletePost
};