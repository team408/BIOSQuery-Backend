const express = require('express');
const router = express.Router();

// Controllers
const homepageController = require("../controllers/homepage");
const endpointsController = require("../controllers/endpoints");

// Main route
router.get("/", homepageController.homepage);

// Endpoints
router.get("/endpoints", endpointsController.getEndpoints);

module.exports = router;