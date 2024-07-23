const fleetService = require('../services/fleet');

async function viewAllHostsRisks(req, res) {
    try {
        const risks = await fleetService.getAllHostsRisks();
        res.render("risks.ejs", { risks });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function viewMitigationAdvices(req, res) {
    try {
        const advices = await fleetService.getMitigationAdvices();
        res.render("mitigation.ejs", { advices });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function downloadCSVReport(req, res) {
    try {
        const risks = await fleetService.getAllHostsRisks();
        const csvReport = await fleetService.generateCSVReport(risks);
        res.header('Content-Type', 'text/csv');
        res.attachment('risks_report.csv');
        res.send(csvReport);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = { viewAllHostsRisks, viewMitigationAdvices, downloadCSVReport };
