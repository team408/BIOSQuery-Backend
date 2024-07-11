const fleetService = require('../services/fleet');
const systemService = require('../services/system');
const chipsecService = require('../services/chipsec')

async function addNode(req, res) {
    try {
        //validate hostId
        const hostId = req.params.hostId
        const osType = req.params.osType;
        if (!hostId || !osType) {
            return res.status(400).send({ error: 'hostID parameter is required' });
        }
        // const {username, password} = req.body;
    
        // console.log("[*] Host to be enrolled: " + hostId)
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
        // console.log("[*] Querieng enrollmentCmd for osType: "+osType);
        enrollCmd = await fleetService.getAgentEnrollCmd(osType);
        // console.log("[*] enrollmentCmd: " + enrollCmd);
        // Executing
        systemService.remoteEnrollLinuxHost(enrollCmd, hostId)
        res.send("Hello agents");
        // endpoints = await fleetService.listEndpoints();
        // res.render("endpoints.ejs", { endpoints: endpoints.hosts });

    } catch (error) {
        console.error(error)
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { addNode};