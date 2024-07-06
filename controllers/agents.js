const fleetService = require('../services/fleet');
const systemService = require('../services/system');

async function addNode(req, res) {
    try {
        //validate host_id
        host_id = req.params.host_id
        console.log("[*] Host to be enrolled: " + host_id)
        // Validate correct osType request
        osType = req.params.osType;
        if (!(['deb', 'rpm', 'pkg', 'msi'].includes(osType))){
            res.status(404).send('Unknown osType')
            return
        }
        if ((['pkg', 'msi'].includes(osType))){
            res.status(404).send('unsupported osType, yet.')
            return
        }
        // get EnrollmentCmd before 
        console.log("[*] Querieng enrollmentCmd for osType: "+osType);
        enrollCmd = await fleetService.getAgentEnrollCmd(osType);
        console.log("[*] enrollmentCmd: " + enrollCmd);
        // Executing
        systemService.remoteEnrollLinHost(enrollCmd, host_id)
        res.send("Hello agents");
        // endpoints = await fleetService.listEndpoints();
        // res.render("endpoints.ejs", { endpoints: endpoints.hosts });

    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { addNode };