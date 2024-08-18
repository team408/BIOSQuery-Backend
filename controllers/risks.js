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


module.exports = { viewAllHostsRisks, viewMitigationAdvices, downloadCSVReport };
