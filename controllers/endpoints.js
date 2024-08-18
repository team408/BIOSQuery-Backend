const fleetService = require('../services/fleet');
const systemService = require('../services/system');
const chipsecService = require('../services/chipsec');

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

async function getEndpoints(req, res) {
    try {
        // Fetch endpoints
        var endpoints = await fleetService.listEndpoints();

        // Act for a single endpoint in case of a id in the query
        if (req.params.id) {
            const endpointId = req.params.id;
            endpoints.hosts = endpoints.hosts.filter(host => host.id === parseInt(endpointId));
            if (!endpoints) {
                return res.status(404).send('Endpoint not found');
            } else{
                const scriptsData = await fleetService.getScriptByEndpoint(endpoints.hosts);
                format_endpoints(endpoints.hosts);
                res.render("endpoints.ejs", { endpoints: endpoints.hosts , scripts: scriptsData, singleEndpoint: true });
                return;
            }
        }

        // Fetch scripts for each endpoint
        const scriptsData = await fleetService.getScriptByEndpoint(endpoints.hosts);

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
        res.render("endpoints.ejs", { endpoints: filteredEndpoints , singleEndpoint: false });

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}


async function addNode(req, res) {
    try {
        console.log('Received request to add host with data:', req.body); // Add log here

        // validate hostId
        const { hostId, osType } = req.body;
        if (!hostId || !osType) {
            return res.status(400).send({ error: 'hostID parameter is required' });
        }

        // Validate correct osType request
        if (!(['deb', 'rpm'].includes(osType))) {
            res.status(404).send('Unknown osType');
            return;
        }

        // Get EnrollmentCmd
        const enrollCmd = await fleetService.getAgentEnrollCmd(osType);

        // Fetch endpoints
        const endpointsData = await fleetService.listEndpoints();

        // Execute enrollment command
        await systemService.remoteEnrollLinuxHost(enrollCmd, hostId);
        res.send("Node enrolled successfully");

    } catch (error) {
        console.error('Error in addNode:', error);
        res.status(500).send('Internal Server Error');
    }
}

function format_endpoints(endpoints) {
    for (endpoint of endpoints) {
        endpoint.formatted_last_scan = formatDate(endpoint.last_scan);
        endpoint.formatted_last_seen = formatDate(endpoint.seen_time);

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

module.exports = { getEndpoints, addNode, getControlPanel, getHostScripts };
