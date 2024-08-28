const fleetSerivce = require('../services/fleet');
const risksSerivce = require('../services/risks');

async function viewAllHostsRisks(req, res) {
    try {
        const risks = await risksSerivce.getAllHostsRisks();
        res.render("risks.ejs", { risks });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function viewMitigationAdvices(req, res) {
    try {
        const advices = await risksSerivce.getMitigationAdvices();
        res.render("mitigation.ejs", { advices });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function downloadCSVReport(req, res) {
    try {
        const risks = await risksSerivce.getAllHostsRisks();
        const csvReport = await risksSerivce.generateCSVReport(risks);
        res.header('Content-Type', 'text/csv');
        res.attachment('risks_report.csv');
        res.send(csvReport);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function getEndpointRiskInfo(req, res) {
    try {
        const hostId = req.params.hostId;
        const riskInfo = await risksSerivce.getLatestChipsecExecutions(hostId);
        if (riskInfo){
            res.status(200).json(riskInfo);
        } else {
            res.status(400).send({"error": "Failed to get risk info"});
        }
    } catch (error) {
            console.log(error);
            res.status(500).send({"error": "Internal Server Error"});
    }
}

module.exports = { viewAllHostsRisks, viewMitigationAdvices, downloadCSVReport, getEndpointRiskInfo};
