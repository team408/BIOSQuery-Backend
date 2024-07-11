const fleetService = require('../services/fleet');

async function dashboard(req, res) {
    try {
        data = await fleetService.buildDashboard();
        console.log(data);
        if (Array.isArray(data)) {
            res.render('dashboard', { data });
        } else {
            res.render('dashboard', { data: [] }); // Render an empty array if data is not an array
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { dashboard };