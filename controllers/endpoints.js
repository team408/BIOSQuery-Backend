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

module.exports = { getEndpoints };
