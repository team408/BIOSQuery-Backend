const fleetService = require('../services/fleet');

async function installChipsec(req, res) {
    try {
        scripts = await fleetService.listScripts();
        installChipsecScriptId = scripts.find(script => script.name === "install_chipsec.sh").id
        installDependenciesScriptId = scripts.find(script => script.name === "install_dependencies.sh").id

        hostId = req.params.hostId
        let install_deps_data=`{"host_id": ${hostId}, "script_id": ${installDependenciesScriptId}}`;
        let install_chipsec_data=`{"host_id": ${hostId}, "script_id": ${installChipsecScriptId}}`;
        response = await fleetService.fleetApiPostRequest("/api/latest/fleet/scripts/run", data=install_deps_data)
        response = await fleetService.fleetApiPostRequest("/api/latest/fleet/scripts/run", data=install_chipsec_data)
        if (response.data.execution_id){
            res.status(200).send({"result": "Chipsec install command sent successfuly!"})
        } else {
            res.status(500).send({"result": "Failed to send command"})
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
        scripts = await fleetService.listScripts();
        uninstallChipsecScriptId = scripts.find(script => script.name === "uninstall_chipsec.sh").id

        hostId = req.params.hostId
        let uninstall_chipsec_data=`{"host_id": ${hostId}, "script_id": ${uninstallChipsecScriptId}}`;
        response = await fleetService.fleetApiPostRequest("/api/latest/fleet/scripts/run", data=uninstall_chipsec_data)
        if (response.data.execution_id){
            res.status(200).send({"result": "Chipsec uninstall command sent successfuly!"})
        } else {
            res.status(500).send({"result": "Failed to send command"})
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