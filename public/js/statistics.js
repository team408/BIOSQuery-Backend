document.addEventListener('DOMContentLoaded', function() {
    const data = JSON.parse(document.getElementById('data-container').textContent);

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            }
        }
    };

    // Summary of Script Execution Statuses Data
    const statusCounts = { 'N/A': 0, 'error': 0, 'ran': 0 };
    data.forEach(item => {
        statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });

    const statusData = {
        labels: ['N/A', 'Error', 'Ran'],
        datasets: [{
            data: [statusCounts['N/A'], statusCounts['error'], statusCounts['ran']],
            backgroundColor: ['#6c757d', '#FF6384', '#36A2EB'],
        }]
    };

    // Render the Status Chart
    const statusCtx = document.getElementById('status-chart').getContext('2d');
    const statusChart = new Chart(statusCtx, {
        type: 'pie',
        data: statusData,
        options: chartOptions
    });

    // Handle click on status chart slices
    statusChart.canvas.onclick = function(event) {
        const segments = statusChart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
        if (segments.length > 0) {
            const clickedSegment = segments[0];
            const statusLabel = statusChart.data.labels[clickedSegment.index];
            const scriptList = document.getElementById('status-script-list');
            scriptList.innerHTML = '';

            if (statusLabel === 'Ran') {
                const ranScripts = data.filter(item => item.status === 'ran');
                ranScripts.forEach(script => {
                    scriptList.innerHTML += `<li>${script.script} - ${formatExecutionTime(script.execution_time)}</li>`;
                });
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
    const scriptChart = new Chart(scriptCtx, {
        type: 'pie',
        data: scriptData,
        options: chartOptions
    });

    // Function to format execution time
    function formatExecutionTime(executionTime) {
        const date = new Date(executionTime);
        return date.toLocaleString();
    }
    
    // Function to sort the table
    function sortTable(table, col, reverse) {
        const tbody = table.tBodies[0];
        const rows = Array.from(tbody.rows);
        const direction = reverse ? -1 : 1;

        rows.sort((a, b) => {
            const aText = a.cells[col].textContent.trim();
            const bText = b.cells[col].textContent.trim();
            
            if (!isNaN(aText) && !isNaN(bText)) {
                return direction * (aText - bText);
            }
            
            return direction * aText.localeCompare(bText);
        });

        rows.forEach(row => tbody.appendChild(row));
    }

    // Add event listeners to table headers
    const table = document.querySelector('table');
    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        header.addEventListener('click', () => {
            const isAscending = header.classList.contains('asc');
            headers.forEach(h => h.classList.remove('asc', 'desc'));
            header.classList.toggle('asc', !isAscending);
            header.classList.toggle('desc', isAscending);
            sortTable(table, index, isAscending);
        });
    });
});