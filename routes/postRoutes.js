const express = require("express");
const { 
    createPost, 
    getPosts, 
    getPostBySlug,
    getMyPosts
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", getPosts);
router.get("/my-posts", protect, getMyPosts);
router.get("/:slug", getPostBySlug);

module.exports = router;