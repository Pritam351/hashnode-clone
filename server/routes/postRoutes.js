const express = require("express");
const { 
    createPost, 
    getPosts, 
    getPostBySlug,
    getMyPosts,
    updatePost,
    deletePost
} = require("../controllers/postController");

const { validatePost } = require("../middleware/validationMiddleware");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, validatePost, createPost);
router.get("/", getPosts);
router.get("/my-posts", protect, getMyPosts);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.get("/:slug", getPostBySlug);

module.exports = router;