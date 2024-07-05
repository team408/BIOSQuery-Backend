const fleetService = require('../services/fleet');

async function addNode(req, res) {
    try {
        res.send('Hello agents');
        // endpoints = await fleetService.listEndpoints();
        // res.render("endpoints.ejs", { endpoints: endpoints.hosts });

    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { addNode };