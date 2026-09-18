const express = require("express");
const { 
    createPost, 
    getPosts, 
    getPostBySlug,
    getMyPosts,
    updatePost,
    deletePost
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", getPosts);
router.get("/my-posts", protect, getMyPosts);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);
router.get("/:slug", getPostBySlug);

module.exports = router;