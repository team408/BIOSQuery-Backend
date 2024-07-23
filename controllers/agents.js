const fleetService = require('../services/fleet');
const systemService = require('../services/system');
const chipsecService = require('../services/chipsec')

async function addNode(req, res) {
    try {
        //validate hostId
        const hostId = req.params.hostId
        const osType = req.params.osType;
        const username = req.body.username;
        const password = req.body.password;
        const privateKey = req.body.privateKey;
        if (!hostId || !osType) {
            return res.status(400).send({ error: 'hostID and osType parameter is required' });
        }
        if (!password && !privateKey) {
            return res.status(400).send({ error: 'either password or privateKey parameter is required' });
        }
    
        console.log("[*] Host to be enrolled: " + hostId)
        // Validate correct osType request
        if (!(['deb', 'rpm', 'pkg', 'msi'].includes(osType))){
            res.status(404).send('Unknown osType')
            return
        }
        if ((['pkg', 'msi'].includes(osType))){
            res.status(404).send('unsupported osType, yet.')
            return
        }
        // get EnrollmentCmd before 
        enrollCmd = await fleetService.getAgentEnrollCmd(osType);
        // Executing
        systemService.remoteEnrollLinuxHost(hostId, username, enrollCmd, password , privateKey)
        const msg = 'Task Submitted, trying to enroll ${hostID}.';
        res.send(msg);
    } catch (error) {
        console.error(error)
        res.status(500).send('Internal Server Error');
    }
};

async function getControlPanel(req, res) {
    try {
        // endpoints = await fleetService.listEndpoints();
        res.render("control.ejs");

    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { addNode, getControlPanel};