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
        const endpointsData = await fleetService.listEndpoints();

        // Fetch scripts for each endpoint
        const scriptsData = await fleetService.getScriptByEndpoint(endpointsData.hosts);

        // Map scripts to their respective endpoints
        const endpointsWithScripts = fleetService.mergeEndpointAndScripts(endpointsData.hosts, scriptsData)

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
        filteredEndpoints.forEach(endpoint => {
            endpoint.formatted_last_scan = formatDate(endpoint.last_scan);
        });
        filteredEndpoints.forEach(endpoint => {
            endpoint.formatted_last_seen = formatDate(endpoint.seen_time);
        });
        res.render("endpoints.ejs", { endpoints: filteredEndpoints });

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



async function getControlPanel(req, res) {
    try {
        res.render("control.ejs");
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = { getEndpoints, addNode, getControlPanel };