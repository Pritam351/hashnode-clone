const validatePost = (req, res, next) => {

    const { title, content, status, tags } = req.body;

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

    if (
        status !== undefined &&
        status !== "published" &&
        status !== "draft"
    ) {
        return res.status(400).json({
            message: "Status must be published or draft"
        });
    }

    if (tags !== undefined && !Array.isArray(tags)) {
        return res.status(400).json({
            message: "Tags must be an array"
        });
    }

    next();
};

module.exports = {
    validatePost
};