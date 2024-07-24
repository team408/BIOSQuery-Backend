const express = require('express');
const router = express.Router();

// Controllers
const homepageController = require("../controllers/homepage");
const endpointsController = require("../controllers/endpoints");
const agentsController = require("../controllers/agents");
const chipsecController = require("../controllers/chipsec");
const dashboardController = require("../controllers/dashboard");
const risksController = require("../controllers/risks");


// Main route
router.get("/", homepageController.homepage);

// Endpoints
router.get("/endpoints", endpointsController.getEndpoints);

// Dashboard
router.get("/dashboard", dashboardController.dashboard);

// Agents
router.post("/api/agents/addNode/:osType/:hostId", agentsController.addNode);

// Chipsec
router.get("/api/chipsec/install/:hostId", chipsecController.installChipsec);
router.get("/api/chipsec/uninstall/:hostId", chipsecController.uninstallChipsec);
router.get("/api/chipsec/runModule/:module/:hostId", chipsecController.runModule);


// Agents
router.post("/api/agents/addNode/:osType/:hostId", agentsController.addNode);
router.get("/controlPanel", agentsController.getControlPanel)

// Chipsec
router.get("/api/chipsec/install/:hostId", chipsecController.installChipsec);
router.get("/api/chipsec/uninstall/:hostId", chipsecController.uninstallChipsec);
router.get("/api/chipsec/runModule/:module/:hostId", chipsecController.runModule);

//Risks
router.get("/risks", risksController.viewAllHostsRisks);
router.get("/risks/mitigation", risksController.viewMitigationAdvices);
router.get("/risks/download", risksController.downloadCSVReport);

module.exports = router;