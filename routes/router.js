const express = require('express');
const router = express.Router();

// Controllers
const homepageController = require("../controllers/homepage");
const endpointsController = require("../controllers/endpoints");
const agentsController = require("../controllers/agents");

// Main route
router.get("/", homepageController.homepage);

// Endpoints
router.get("/endpoints", endpointsController.getEndpoints);

// Agents
router.post("/api/agents/addNode/:osType/:host_id", agentsController.addNode);

module.exports = router;