const fleetService = require('../services/fleet');

async function statistics(req, res) {
    try {
        data = await fleetService.buildStatistics();
        const statusCounts = { 'N/A': 0, 'error': 0, 'ran': 0 };
        const scriptCounts = {};
        data.forEach(item => {
                statusCounts[item.status]++;
                scriptCounts[item.script] = (scriptCounts[item.script] || 0) + 1;
        });
        
        if (Array.isArray(data)) {
            res.render('statistics', { data: data, statusCounts: statusCounts, scriptCounts: scriptCounts });
        } else {
            res.render('statistics', { data: [] , statusCounts: statusCounts, scriptCounts: scriptCounts}); // Render an empty array if data is not an array
        }
    } catch (error) {
        console.log(error)
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { statistics };