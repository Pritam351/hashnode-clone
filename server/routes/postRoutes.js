const express = require("express");
const { 
    createPost, 
    getPosts, 
    getPostBySlug 
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", getPosts);
router.get("/:slug", getPostBySlug);

module.exports = router;