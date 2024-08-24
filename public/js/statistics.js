document.addEventListener('DOMContentLoaded', function() {
    const data = JSON.parse(document.getElementById('data-container').textContent);

    // Function to format the date to day/month/year
function formatDate(executionTime) {
    const date = new Date(executionTime);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Use formatDate when rendering the tables
data.forEach(item => {
    item.execution_time = formatDate(item.execution_time);
});
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
        options: chartOptions
    });

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

    // Apply sorting to all tables
    const tables = document.querySelectorAll('.sortable');
    tables.forEach(table => {
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
});


