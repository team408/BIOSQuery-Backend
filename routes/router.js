const express = require('express');
const router = express.Router();

// Controllers
const homepageController = require("../controllers/homepage");
const endpointsController = require("../controllers/endpoints");
const agentsController = require("../controllers/agents");
const chipsecController = require("../controllers/chipsec");
const dashboardController = require("../controllers/statistics");

// Main route
router.get("/", homepageController.homepage);

// Endpoints
router.get("/endpoints", endpointsController.getEndpoints);

// Dashboard
router.get("/statistics", dashboardController.statistics);

// Agents
router.post("/api/agents/addNode/:osType/:hostId", (req, res, next) => {
    console.log('addNode route called');
    next();
}, agentsController.addNode);

router.get("/controlPanel", (req, res, next) => {
    console.log('getControlPanel route called');
    next();
}, agentsController.getControlPanel);

// Chipsec
router.get("/api/chipsec/install/:hostId", chipsecController.installChipsec);
router.get("/api/chipsec/uninstall/:hostId", chipsecController.uninstallChipsec);
router.get("/api/chipsec/runModule/:module/:hostId", chipsecController.runModule);

module.exports = router;
