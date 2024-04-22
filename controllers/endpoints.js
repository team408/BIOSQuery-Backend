const fleetService = require('../services/fleet');

async function getEndpoints(req, res) {
    endpointsUri = '/api/v1/fleet/hosts?page=0&per_page=100'
    endpoints = await fleetService.fleetApiRequest(endpointsUri);
    res.render("endpoints.ejs", { endpoints: endpoints.hosts });
};

module.exports = { getEndpoints };