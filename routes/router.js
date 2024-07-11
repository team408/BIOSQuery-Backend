const express = require('express');
const router = express.Router();

// Controllers
const homepageController = require("../controllers/homepage");
const endpointsController = require("../controllers/endpoints");
const dashboardController = require("../controllers/dashboard");

// Main route
router.get("/", homepageController.homepage);

// Endpoints
router.get("/endpoints", endpointsController.getEndpoints);

// Dashboard
router.get("/dashboard", dashboardController.dashboard);

module.exports = router;