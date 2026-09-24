const express = require("express");
const router = express.Router();

const {
    getUserById,
    getUserPosts,
    updateMe
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

router.put("/me", protect, updateMe);
router.get("/:id/posts", getUserPosts);
router.get("/:id", getUserById);

module.exports = router;
