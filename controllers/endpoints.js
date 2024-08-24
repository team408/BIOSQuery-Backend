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
            res.status(400).send("endpointID id parmeter not submitted");
            return
        }
        
        // Fetch endpoint
        var endpoint = await fleetService.getEndpoint(req.params.id);
        if (!endpoint) {
            return res.status(404).send('Endpoint not found');
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

module.exports = { getEndpoints, getEndpointsJson, getSingleEndpoint, getControlPanel };