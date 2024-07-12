const fleetService = require('../services/fleet');

async function installChipsec(req, res) {
    try {
        //run fleet api to run fleet script to install chipsec
        // response = await fleetService.fleetApiGetRequest(/**enter here api to run scripts */)
        res.status(200).send("Chipsec Installed Successfuly!")

    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');
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