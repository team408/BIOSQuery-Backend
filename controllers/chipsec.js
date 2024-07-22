const fleetService = require('../services/fleet');
const axios = require('axios').default;

async function installChipsec(req, res) {
    try {
        scripts = await fleetService.listScripts();
        installChipsecScriptId = scripts.find(script => script.name === "install_chipsec.sh").id
        installDependenciesScriptId = scripts.find(script => script.name === "install_dependencies.sh").id

        hostId = req.params.hostId
        let data=`{"host_id": ${hostId}, "script_id": ${installDependenciesScriptId}}`;
        response = await fleetService.fleetApiPostRequest("/api/latest/fleet/scripts/run", data=data)
        if (response.data.execution_id){
            res.status(200).send({"result": "Chipsec install command sent!"})
        } else {
            res.status(500).send({"result": "Failed to send install command"})
        }

    } catch (error) {
        if (error.response){
            console.log(error.response.data);
            res.status(error.response.status).send({"result":error.response.data});
            return
        }
        console.log(error);
        res.status(500).send(
            {
                'result':'Internal Server Error'
            }
        );
        return;
    }
};

async function uninstallChipsec(req, res) {
    try {
        //run fleet api to run fleet script to uninstall chipsec
        // response = await fleetService.fleetApiGetRequest(/**enter here api to run scripts */)
        res.status(200).send("Chipsec Uninstalled Successfuly!")

    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');
    }
};

async function runModule(req, res) {
    try {
        // Validate requested module exists in pool
        if (!modules.includes(req.params.module)){
            res.status(404).send("Unknown module to be run.")
            return
        }
        // acroding to requested module run fleet api to run fleet script to execute
        // response = await fleetService.fleetApiGetRequest(/**enter here api to run scripts */)
        res.status(200).send("here are results from the module run/")

    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { installChipsec, uninstallChipsec, runModule};