const express = require('express');
const router = express.Router();

// Controllers
const homepageController = require("../controllers/homepage");
const endpointsController = require("../controllers/endpoints");
const agentsController = require("../controllers/agents");
const chipsecController = require("../controllers/chipsec");
const dashboardController = require("../controllers/statistics");
const risksController = require("../controllers/risks"); 
const infoCenterController = require("../controllers/information_center");
const notificationsController = require("../controllers/notifications");
const adminPanelController = require('../controllers/admin_panel');


// Main route
router.get("/", homepageController.homepage);

// Endpoints
router.get("/endpoints", endpointsController.getEndpoints);
router.get("/endpoints/:id", endpointsController.getSingleEndpoint);

// Dashboard
router.get("/statistics", dashboardController.statistics);

// Agents
router.post("/api/agents/addNode/:osType/:hostId", agentsController.addNode);

router.get("/api/agents/rmNode/:hostId", agentsController.rmNode);

router.get("/controlPanel", (req, res, next) => {
    console.log('getControlPanel route called');
    next();
}, agentsController.getControlPanel);

// Chipsec
router.get("/api/chipsec/install/:hostId", chipsecController.installChipsec);
router.get("/api/chipsec/uninstall/:hostId", chipsecController.uninstallChipsec);
router.get("/api/chipsec/run/:hostId/:module", chipsecController.runModule);

// Risks
router.get("/risks", risksController.viewAllHostsRisks);
router.get("/risks/mitigation", risksController.viewMitigationAdvices);
router.get("/risks/download", risksController.downloadCSVReport);
router.get("/api/risks/:hostId", risksController.getEndpointRiskInfo);

// Information Center
router.get("/information-center", infoCenterController.showInfoCenter); 

router.get("/api/hosts/:hostId/scripts", endpointsController.getHostScripts);

// Notifications
router.get("/api/notifications/all", notificationsController.getAllNotifications)
router.get("/api/notifications/today", notificationsController.getNotificationsLastDay)
router.get("/api/notifications/read/:id", notificationsController.readNotifcation)
router.get("/api/notifications/unread/:id", notificationsController.unreadNotifcation)

// Admin Panel
router.get('/admin-panel', adminPanelController.getAdminPanel);
router.post('/admin-panel/save-scan-settings', adminPanelController.saveScanSettings);
router.post('/admin-panel/save-module-settings', adminPanelController.saveModuleSettings);

module.exports = router;