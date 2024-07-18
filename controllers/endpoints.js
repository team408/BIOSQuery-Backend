const fleetService = require('../services/fleet');
const systemService = require('../services/system');
const chipsecService = require('../services/chipsec');

async function getEndpoints(req, res) {
    try {
        const endpoints = await fleetService.listEndpoints(); // ודא שיש לך את someService להחזרת נקודות הקצה
        res.render("endpoints.ejs", { endpoints: endpoints.hosts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function addNode(req, res) {
    try {
        //validate hostId
        const hostId = req.params.hostId;
        const osType = req.params.osType;
        if (!hostId || !osType) {
            return res.status(400).send({ error: 'hostID parameter is required' });
        }

        // Validate correct osType request
        if (!(['deb', 'rpm', 'pkg', 'msi'].includes(osType))) {
            res.status(404).send('Unknown osType');
            return;
        }
        if ((['pkg', 'msi'].includes(osType))) {
            res.status(404).send('unsupported osType, yet.');
            return;
        }

        // Get EnrollmentCmd
        const enrollCmd = await fleetService.getAgentEnrollCmd(osType);

        // Execute enrollment command
        await systemService.remoteEnrollLinuxHost(enrollCmd, hostId);
        res.send("Node enrolled successfully");

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function getControlPanel(req, res) {
    try {
        res.render("control.ejs");
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = { getEndpoints, addNode, getControlPanel };
