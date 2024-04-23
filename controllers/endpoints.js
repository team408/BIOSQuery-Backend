const fleetService = require('../services/fleet');

async function getEndpoints(req, res) {
    try {

        endpointsUri = '/api/v1/fleet/hosts?page=0&per_page=100'
        endpoints = await fleetService.fleetApiRequest(endpointsUri);
        res.render("endpoints.ejs", { endpoints: endpoints.hosts });

    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { getEndpoints };