document.addEventListener('DOMContentLoaded', function() {
    const data = JSON.parse(document.getElementById('data-container').textContent);

    // Ensure data is correctly loaded
    console.log("Data:", data);

    // Summary of Script Execution Statuses Data
    const statusCounts = { 'N/A': 0, 'error': 0, 'ran': 0 };
    data.forEach(item => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });

    const statusData = {
        labels: ['N/A', 'Error', 'Ran'],
        datasets: [{
            data: [statusCounts['N/A'], statusCounts['error'], statusCounts['ran']],
            backgroundColor: ['#FFCE56', '#FF6384', '#36A2EB'],
        }]
    };

    // Render the Status Chart
    const statusCtx = document.getElementById('status-chart').getContext('2d');
    const statusChart = new Chart(statusCtx, {
        type: 'pie',
        data: statusData,
    });

    // Handle click on status chart slices
    statusChart.canvas.onclick = function(event) {
        console.log("statusChart:", statusChart); // Check `statusChart` context
        console.log("Event:", event); // Check event details

        var segments = statusChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);

        if (segments.length > 0) {
            var clickedSegment = segments[0];
            var statusLabel = clickedSegment.element.$context.raw; // Access label of the clicked segment

            if (statusLabel === 'Ran') {
                var ranScripts = data.filter(function(item) {
                    return item.status === 'ran';
                });

                var scriptList = document.getElementById('script-list');
                scriptList.innerHTML = "<h2>Most Recently Executed Scripts</h2><ul>";
                ranScripts.forEach(function(script) {
                    scriptList.innerHTML += "<li>" + script.script + " - " + script.execution_time + "</li>";
                });
                scriptList.innerHTML += "</ul>";
            }
        }
    };

    // Most Frequently Executed Scripts Data
    const scriptCounts = {};
    data.forEach(item => {
        scriptCounts[item.script] = (scriptCounts[item.script] || 0) + 1;
    });

    const scriptLabels = Object.keys(scriptCounts);
    const scriptDataValues = Object.values(scriptCounts);

    const scriptData = {
        labels: scriptLabels,
        datasets: [{
            data: scriptDataValues,
            backgroundColor: scriptLabels.map((label, index) => {
                const colors = ['#FFCE56', '#FF6384', '#36A2EB', '#4BC0C0', '#9966FF', '#FF9F40'];
                return colors[index % colors.length];
            })
        }]
    };

    // Render the Script Chart
    const scriptCtx = document.getElementById('script-chart').getContext('2d');
    new Chart(scriptCtx, {
        type: 'pie',
        data: scriptData,
    });
});
