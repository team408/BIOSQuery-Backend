const fleetService = require('../services/fleet');

async function getEndpoints(req, res) {
    try {
        endpoints = await fleetService.listEndpoints();

        if (req.query.search) {
            const searchQuery = req.query.search.toLowerCase();
            endpoints.hosts = endpoints.hosts.filter((host) => {
                return host.hostname.toLowerCase().includes(searchQuery) ||
                    host.primary_ip.toLowerCase().includes(searchQuery) ||
                    host.primary_mac.toLowerCase().includes(searchQuery);
            });
        }

        res.render("endpoints.ejs", { endpoints: endpoints.hosts });

    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { getEndpoints };