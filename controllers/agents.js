const { response } = require('express');
const fs = require('fs')
const path = require('path');
const fleetService = require('../services/fleet');
const systemService = require('../services/system');
const notificationsService = require('../services/notifications');

const fleetPlatformString = {"debian": "ubuntu", "kali": "ubuntu", "ubuntu" : "ubuntu", "centos" : "centos", "rhel" : "centos", "deb": "ubuntu", "rpm": "centos"}
const osToDeleteScript = {"ubuntu": "remove_fleet_ubuntu.sh", "centos" : "remove_fleet_centos.sh"}
const installerByOs = {"ubuntu": "apt", "centos" : "yum"}
const dpkgByOs = {"ubuntu": "dpkg", "centos" : "rpm"}
const fleetctlBashDownload = fs.readFileSync('./scripts/install_fleet.sh').toString()
const hostAddDescSuccess = "Host has been added succesfuly! Further information and actions may be viewd in the <a href='/endpoints'>Endpoints</a> panel."
const hostAddDescFailure = "Something went wrong adding this host. You may want to try another enrollment option.";
const hostRmDescSuccess = "Host removed succesfuly.";
const hostRmDescFailure = "Something went wrong removing this host..";

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getEnrollOneliner(req, res){
    try{
        const platformType = req.params.osType;
        if (!platformType) {
            return res.status(400).send({ error: 'osType parameter is required' });
        }

        if (!(['deb', 'rpm', 'pkg', 'msi'].includes(platformType))){
            res.status(404).send('Unknown osType');
            return;
        }
        if ((['pkg', 'msi'].includes(platformType))){
            res.status(404).send('unsupported osType, yet.');
            return;
        }
        let osType = fleetPlatformString[platformType];
        let curlInstallCmd = ["sudo ", installerByOs[osType], " update && ", installerByOs[osType], " -y install curl"].join("");
        let fleetctInstallCmd = fleetctlBashDownload;
        let enrollCmd = await fleetService.getAgentEnrollCmd(osType);
        let dpkgCmd = ["sudo ", dpkgByOs[osType]," -i fleet-osquery*.", osType, ";"].join("");
        const oneLiner = [curlInstallCmd, ";\n", fleetctInstallCmd, ";\n", enrollCmd, ";\n", dpkgCmd].join("")
        res.status(200).send(oneLiner);
    }
    catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

async function addNode(req, res) {
    try {
        const hostId = req.params.hostId;
        const platformType = req.params.osType;
        const username = req.body.username;
        const password = req.body.password;
        const privateKey = req.body.privateKey;
        if (!hostId) {
            return res.status(400).send({ error: 'hostID parameter is required' });
        }
        if (!platformType) {
                return res.status(400).send({ error: 'osType parameter is required' });
        }
        if (!password && !privateKey) {
            return res.status(400).send({ error: 'either password or privateKey parameter is required' });
        }

        if (!(['deb', 'rpm', 'pkg', 'msi'].includes(platformType))){
            res.status(404).send({ error: 'Unknown osType'});
            return;
        }
        if ((['pkg', 'msi'].includes(platformType))){
            res.status(404).send({ error: 'unsupported osType, yet.'});
            return;
        }
        const msg = 'Task Submitted, trying to enroll ' + hostId;
        res.status(200).send({result: msg});
        // get EnrollmentCmd before 
        let enrollCmd = await fleetService.getAgentEnrollCmd(platformType);
        // Executing
        let osType = fleetPlatformString[platformType];
        let result = await systemService.remoteEnrollLinuxHost(hostId, username, osType, enrollCmd, password , privateKey)
        if (result){
            notificationsService.newNotification("Agents", "Add host [" + hostId + "] action SUCCESS", hostAddDescSuccess);
        }
        else{
            notificationsService.newNotification("Agents", "Add host [" + hostId + "] action FAILURE", hostAddDescFailure);    
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        notificationsService.newNotification("Agents", "Add host [" + hostId + "] action FAILURE", hostAddDescFailure);
    }
}

async function rmNode(req, res) {
    const hostId = req.params.hostId;
    let host;
    try {
        if (!hostId) {
            res.status(400).send({ error: 'hostID parameter is required' });
            return
        }
        //check if host exists
        host = (await fleetService.getEndpoint(hostId));
        if (!host){
            res.status(400).send({"result":'Unknown host.'})
            return
        }
        let msg = 'Task Submitted, trying to remove ' + host.display_name;
        res.status(200).send({"result": msg});
    } catch (error) {
        console.error(error);
        res.status(500).send({"result":'Internal Server Error'});
    }
    try{
        // get host os
        const osType = fleetPlatformString[host.platform]

        // get uninstall scriptID for requested OS
        const scriptName = osToDeleteScript[osType]
        let execution_id = await fleetService.runScriptByName(hostId, scriptName)
        // check if script has been ran correctly? 
        if (!execution_id){
            console.error("[!] Error deleting host")
        }
        let response;

        if (execution_id != 409){
            do{
                await sleep(5000)
                response = await fleetService.fleetApiGetRequest("/api/v1/fleet/scripts/results/" + execution_id)
            }while(response.exit_code == null)
        }
        //validate script has finished

        // delete via fleet api
        response = await fleetService.removeHostFromFleetById(hostId);
        if (!response) {
            console.error(`Failed to remove host with response data: ${response}`);
            notificationsService.newNotification("Agents", "Rm host [" + host.display_name + "] action FAILURE", `Failed to remove host with response data: ${response}`);
            throw(response)
        }
        notificationsService.newNotification("Agents", "Rm host [" + host.display_name + "] action SUCCESS", hostRmDescSuccess);

    } catch (error) {
        console.error(error);
        notificationsService.newNotification("Agents", "Rm host [" + host.display_name + "] action FAILURE", hostRmDescFailure);
    }
}

async function getControlPanel(req, res) {
    try {
        res.render("control.ejs");
    } catch (error) {
        console.log(error);
        res.status(500).send({"result":'Internal Server Error'});
    }
}

module.exports = { addNode, rmNode, getControlPanel, getEnrollOneliner};