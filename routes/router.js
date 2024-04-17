const express = require('express');
const router = express.Router();

// Controllers
const homepageController = require("../controllers/homepage");

// Main route
router.get("/", homepageController.homepage);

module.exports = router;