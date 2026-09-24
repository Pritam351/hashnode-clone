const Tag = require("../models/Tag");
const Post = require("../models/Post");
const generateSlug = require("../utils/generateSlug");

const createTag = async (req, res, next) => {
    try {

        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Tag name is required"
            });
        }

        const tagName = name.trim();

        if (!tagName) {
            return res.status(400).json({
                message: "Tag name is required"
            });
        }

        const slug = generateSlug(tagName);

        const existingTag = await Tag.findOne({
            slug
        });

        if (existingTag) {
            return res.status(409).json({
                message: "Tag already exists"
            });
        }

        const tag = await Tag.create({
            name: tagName,
            slug
        });

        return res.status(201).json({
            message: "Tag created successfully",
            tag
        });


    } catch (error) {
        next(error);
    }
};

const getTags = async (req, res, next) => {
    try {
        const tags = await Tag.find().sort({ name: 1 });
        const postCounts = await Post.aggregate([
            {
                $match: {
                    status: "published"
                }
            },
            {
                $unwind: "$tags"
            },
            {
                $group: {
                    _id: "$tags",
                    postCount: {
                        $sum: 1
                    }
                }
            }
        ]);

        const postCountByTagId = new Map(
            postCounts.map(({ _id, postCount }) => [
                _id.toString(),
                postCount
            ])
        );

        const tagsWithPostCounts = tags.map(tag => ({
            ...tag.toObject(),
            postCount: postCountByTagId.get(tag._id.toString()) || 0
        }));

        res.status(200).json({
            count: tags.length,
            tags: tagsWithPostCounts
        });

    } catch (error) {
        next(error);
    }
};

const getTagBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const tag = await Tag.findOne({ slug });

        if (!tag) {
            return res.status(404).json({
                message: "Tag not found"
            });
        }

        const posts = await Post.find({
            tags: tag._id,
            status: "published"
        })
            .populate("author", "name email")
            .populate("tags", "name slug")
            .sort({ createdAt: -1 });

        res.status(200).json({
            tag: {
                id: tag._id,
                name: tag.name,
                slug: tag.slug
            },
            count: posts.length,
            posts
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createTag,
    getTags,
    getTagBySlug
};
