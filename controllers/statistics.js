const fleetService = require('../services/fleet');

async function statistics(req, res) {
    try {
        const data = await fleetService.buildStatistics();
        const statusCounts = { 'N/A': 0, 'error': 0, 'ran': 0 };
        const scriptCounts = {};
        const endpointHealth = [];
        const detailedAnalytics = [];
        const endpointPerformance = {};
        
        data.forEach(item => {
            statusCounts[item.status]++;
            scriptCounts[item.script] = (scriptCounts[item.script] || 0) + 1;

            // Collect endpoint performance data
            if (!endpointPerformance[item.endpoint]) {
                endpointPerformance[item.endpoint] = { success: 0, total: 0, risks: [] };
            }
            endpointPerformance[item.endpoint].total++;
            if (item.status === 'ran') {
                endpointPerformance[item.endpoint].success++;
            } else if (item.status === 'error') {
                endpointPerformance[item.endpoint].risks.push('Error during execution');
            }

            // Add to detailed analytics
            detailedAnalytics.push({
                script: item.script,
                executions: scriptCounts[item.script],
                avgTime: (parseFloat(item.execution_time) || 0).toFixed(2) + ' seconds',
                successRate: ((endpointPerformance[item.endpoint].success / endpointPerformance[item.endpoint].total) * 100).toFixed(2) + '%'
            });
        });

        // Calculate top performing endpoints and their health overview
        for (const [endpoint, stats] of Object.entries(endpointPerformance)) {
            endpointHealth.push({
                endpoint,
                successRate: ((stats.success / stats.total) * 100).toFixed(2) + '%',
                risks: stats.risks.length > 0 ? stats.risks.join(', ') : 'No issues detected'
            });
        }

        const topPerforming = Object.keys(endpointPerformance).map(key => ({ endpoint: key, ...endpointPerformance[key] }));

        res.render('statistics', {
            data,
            statusCounts,
            scriptCounts,
            endpointHealth,
            detailedAnalytics,
            topPerforming
        });

    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = { statistics };
