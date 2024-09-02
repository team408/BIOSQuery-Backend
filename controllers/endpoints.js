const fleetService = require('../services/fleet');

function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getUTCMonth() + 1; // Months are zero-based
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    return `${month}/${day}/${year}, ${hours}:${minutes}:${seconds}`;
}

async function getSingleEndpoint(req, res) {
    try {
        if (!req.params.id) {
            res.status(400).send({"result":"endpointID id parmeter not submitted"});
            return
        }
        
        // Fetch endpoint
        var endpoint = await fleetService.getEndpoint(req.params.id);
        if (!endpoint) {
            return res.status(404).send({"result":'Endpoint not found'});
        } else {
            const scriptsData = await fleetService.getScriptsBySingleEndpoint(endpoint);
            format_single_endpoint(endpoint);
            res.render("single_endpoint.ejs", {endpoint: endpoint, scripts: scriptsData, singleEndpoint: true});
        }
    } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
    }
}

async function getEndpoints(req, res) {
    try {
        res.render("endpoints.ejs");

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

async function getEndpointsJson(req, res) {
    try {
        // Fetch endpoints
        var endpoints = await fleetService.listEndpoints();

        // Fetch scripts for each endpoint
        const scriptsData = await fleetService.getScriptsByEndpointList(endpoints.hosts);

        // Map scripts to their respective endpoints
        const endpointsWithScripts = fleetService.mergeEndpointAndScripts(endpoints.hosts, scriptsData)

        // Apply search filter if present
        let filteredEndpoints = endpointsWithScripts;
        if (req.query.search) {
            const searchQuery = req.query.search.toLowerCase();
            filteredEndpoints = endpointsWithScripts.filter(host => {
                return host.hostname.toLowerCase().includes(searchQuery) ||
                    host.primary_ip.toLowerCase().includes(searchQuery) ||
                    host.primary_mac.toLowerCase().includes(searchQuery);
            });
        }
        
        format_endpoints(filteredEndpoints);
        res.status(200).json(filteredEndpoints);

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

function format_single_endpoint(endpoint){
    endpoint.formatted_last_scan = formatDate(endpoint.last_scan);
    endpoint.formatted_last_seen = formatDate(endpoint.seen_time);
}

function format_endpoints(endpoints) {
    for (let endpoint of endpoints) {
        format_single_endpoint(endpoint)
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

async function getHostScripts(req, res) {
    try {
        const hostId = req.params.hostId;
        const scripts = await fleetService.getScriptsByHost(hostId);
        res.json(scripts);
    } catch (error) {
        console.error('Error fetching scripts:', error);
        res.status(500).send('Internal Server Error');
    }
}
async function scheduleScan(req, res) {
    const { frequency, time, enableScans } = req.body;

    try {
        // Implement logic to save the schedule configuration to your service/database
        await fleetService.scheduleNetworkScan(frequency, time, enableScans);

        // Redirect back to the admin panel with a success message
        res.redirect('/admin-panel');
    } catch (error) {
        console.error('Error scheduling scan:', error);
        res.status(500).send('Internal Server Error');
    }
}


async function manageModules(req, res) {
    const { modules, excludedModules } = req.body;

    try {
        // Implement logic to update module configuration based on user selection
        await fleetService.updateModuleConfig(modules, excludedModules);

        // Redirect back to the admin panel with a success message
        res.redirect('/admin-panel');
    } catch (error) {
        console.error('Error managing modules:', error);
        res.status(500).send('Internal Server Error');
    }
}

async function renderAdminPanel(req, res) {
    try {
        // Fetch the list of available modules (scripts)
        const scripts = await fleetService.listScripts();

        // Filter the scripts to only include those relevant to network scans
        const modules = scripts.filter(script => {
            // Add any logic to filter out specific scripts or include only certain ones
            // Example: Include only scripts with names that start with 'chipsec'
            return script.name.startsWith('chipsec');
        });

        // Render the admin panel view with the modules
        res.render("admin_panel.ejs", { modules: modules });
    } catch (error) {
        console.error('Error rendering Admin Panel:', error);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = { getEndpoints, getEndpointsJson, getSingleEndpoint, getControlPanel, getHostScripts,scheduleScan,  manageModules, renderAdminPanel,  };