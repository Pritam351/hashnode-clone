const express = require("express");

const { createTag, getTags, getTagBySlug } = require("../controllers/tagController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createTag); 
router.get("/", getTags);
router.get("/:slug", getTagBySlug);

module.exports = router;