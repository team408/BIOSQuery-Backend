const fleetService = require('../services/fleet');
const systemService = require('../services/system');

async function addNode(req, res) {
    try {
        const hostId = req.params.hostId;
        const osType = req.params.osType;
        if (!hostId || !osType) {
            return res.status(400).send({ error: 'hostID parameter is required' });
        }

        if (!(['deb', 'rpm', 'pkg', 'msi'].includes(osType))){
            res.status(404).send('Unknown osType');
            return;
        }
        if ((['pkg', 'msi'].includes(osType))){
            res.status(404).send('unsupported osType, yet.');
            return;
        }

        const enrollCmd = await fleetService.getAgentEnrollCmd(osType);
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

module.exports = { addNode, getControlPanel };
