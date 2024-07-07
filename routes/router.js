const express = require('express');
const router = express.Router();

// Controllers
const homepageController = require("../controllers/homepage");
const endpointsController = require("../controllers/endpoints");
const agentsController = require("../controllers/agents");
const chipsecController = require("../controllers/chipsec");
const dashboardController = require("../controllers/dashboard");

// Main route
router.get("/", homepageController.homepage);

// Endpoints
router.get("/endpoints", endpointsController.getEndpoints);
// Agents
router.post("/api/agents/addNode/:osType/:host_id", agentsController.addNode);

// Chipsec
router.get("/api/chipsec/install/:host_id", chipsecController.installChipsec);
router.get("/api/chipsec/uninstall/:host_id", chipsecController.uninstallChipsec);
router.get("/api/chipsec/runModule/:module/:host_id", chipsecController.runModule);

// Dashboard
router.get("/dashboard", dashboardController.dashboard);

module.exports = router;