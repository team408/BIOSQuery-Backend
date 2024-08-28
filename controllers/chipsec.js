const fleetService = require('../services/fleet');
const fs = require('fs');
const path = require('path');


const modules_to_scripts = {
    "common-smm": "chipsec_common_smm.sh",
    "common-spi-desc": "chipsec_common_spi_desc.sh",
    "common-spi-lock": "chipsec_common_spi_lock.sh",
    "common-bios-wp": "chipsec_common_bios_wp.sh",
    "common-bios-ts": "chipsec_common_bios_ts.sh",
    "common-smrr" : "chipsec_common_smrr.sh",
    "tools-smm-smm-ptr": "chipsec_tools_smm_smm_ptr.sh"
}

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
        if (!modules_to_scripts[req.params.module]){
            res.status(404).send("Unknown module to be run.")
            return
        }

        endpoints = await fleetService.listEndpoints();
        if (!endpoints.hosts.find(endpoint => endpoint.id === parseInt(req.params.hostId))){
            res.status(404).send("Unknown host to run module on.")
            return
        }

        scripts = await fleetService.listScripts();
        moduleScript = scripts.find(script => script.name === modules_to_scripts[req.params.module]);
        if (!moduleScript){
            res.status(404).send("Unknown module script to be run.")
            return
        }
        moduleScriptID = moduleScript.id
        let module_data=`{"host_id": ${req.params.hostId}, "script_id": ${moduleScriptID}}`;
        response = await fleetService.fleetApiPostRequest("/api/latest/fleet/scripts/run", data=module_data)
        
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

async function assignModulesToEndpoint(req, res) {
    try {
        const { endpoint, modules } = req.body;
        if (!endpoint || !modules) {
            return res.status(400).send('Endpoint and modules are required.');
        }

        // Load existing module settings
        const settingsPath = path.join(__dirname, '../config/moduleSettings.json');
        let settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

        // Update settings for the endpoint
        settings.selectedModules = settings.selectedModules.filter(mod => mod.endpoint !== endpoint);
        settings.selectedModules.push({ endpoint, modules });

        // Save the updated settings back to the file
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

        res.status(200).json({ message: 'Module settings saved successfully!' });
    } catch (error) {
        console.error('Error assigning modules to endpoint:', error);
        res.status(500).send('Failed to save module settings.');
    }
}

module.exports = { installChipsec, uninstallChipsec, runModule, assignModulesToEndpoint};