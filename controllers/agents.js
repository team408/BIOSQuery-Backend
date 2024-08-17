const { response } = require('express');
const fleetService = require('../services/fleet');
const systemService = require('../services/system');

fleetPlatformString = {"debian": "ubuntu", "kali": "ubuntu", "ubuntu" : "ubuntu", "centos" : "centos", "rhel" : "centos"}
os_to_delete_script = {"ubuntu": "removeFleetUbuntu.sh", "centos" : "RemoveFleetCentos.sh"}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function addNode(req, res) {
    try {
        const hostId = req.params.hostId;
        const osType = req.params.osType;
        const username = req.body.username;
        const password = req.body.password;
        const privateKey = req.body.privateKey;
        if (!hostId) {
            return res.status(400).send({ error: 'hostID parameter is required' });
        }
        if (!osType) {
                return res.status(400).send({ error: 'osType parameter is required' });
        }
        if (!password && !privateKey) {
            return res.status(400).send({ error: 'either password or privateKey parameter is required' });
        }
    
        console.log("[*] Host to be enrolled: " + hostId)
        // Validate correct osType request

        if (!(['deb', 'rpm', 'pkg', 'msi'].includes(osType))){
            res.status(404).send('Unknown osType');
            return;
        }
        if ((['pkg', 'msi'].includes(osType))){
            res.status(404).send('unsupported osType, yet.');
            return;
        }

        // get EnrollmentCmd before 
        enrollCmd = await fleetService.getAgentEnrollCmd(osType);
        // Executing
        systemService.remoteEnrollLinuxHost(hostId, username, enrollCmd, password , privateKey)
        const msg = 'Task Submitted, trying to enroll' + hostId;
        res.status(200).send(msg);

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function rmNode(req, res) {
    try {
        const hostId = req.params.hostId;
        if (!hostId) {
            return res.status(400).send({ error: 'hostID parameter is required' });
        }
        console.log("[*] Host to be removed: " + hostId)
        //check if host exists
        const host = (await fleetService.getEndpoint(hostId));
        if (!host){
            res.status(404).send("Unknown host to delete.")
            return
        }
        let msg = 'Task Submitted, trying to remove ' + hostId;
        res.status(200).send(msg);
        // get host os
        const osType = fleetPlatformString[host.platform]

        // get uninstall scriptID for requested OS
        const scriptName = os_to_delete_script[osType]
        let execution_id = await fleetService.runScriptByName(hostId, scriptName)
        // check if script has been ran correctly? 
        if (!execution_id){
            console.error("[!] Error deleting host")
        }
        let response;
        //validate script has finished:
        do{
            await sleep(5000)
            response = await fleetService.fleetApiGetRequest("/api/v1/fleet/scripts/results/" + execution_id)
        }while(response.exit_code == null)

        // delete via fleet api
        response = await fleetService.removeHostFromFleetById(hostId);
        if (!response) {
            throw new Error(`Failed to remove host with response data: ${response}`);
        }

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

module.exports = { addNode, rmNode, getControlPanel };