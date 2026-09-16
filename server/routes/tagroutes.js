const express = require("express");

const { createTag } = require("../controllers/tagController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createTag); 

module.exports = router;