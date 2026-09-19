const express = require("express");
const router = express.Router();

const { getUserById, getUserPosts } = require("../controllers/userController");

router.get("/:id/posts", getUserPosts);
router.get("/:id", getUserById);

module.exports = router;