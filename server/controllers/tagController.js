const Tag = require("../models/Tag");

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

        const slug = tagName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");


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

module.exports = {
    createTag
};