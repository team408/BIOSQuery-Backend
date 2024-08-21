$(document).ready(function(){
    $('[data-bs-toggle="tooltip"]').tooltip();
 // Function to format the date
 function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

 // Info button click event
$('.info-btn').click(async function() {
    const hostId = $(this).data('host-id');
    console.log(`Host ID: ${hostId}`); // Log the Host ID

    if (!hostId) {
        console.error('Host ID is not defined.');
        return;
}

try {
        const response = await fetch(`/api/hosts/${hostId}/scripts`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const scripts = await response.json();
        console.log("Fetched scripts:", scripts);  // Debugging line

        let scriptDetails = '';
        scripts.forEach(script => {
            const scriptName = script.name || 'N/A';
            const executionTime = script.last_execution && script.last_execution.executed_at 
                                    ? new Date(script.last_execution.executed_at).toLocaleString()
                : 'Invalid Date';
            const status = script.last_execution && script.last_execution.status
                ? script.last_execution.status
                : 'N/A';
            scriptDetails += `
                <tr>
                    <td>${scriptName}</td>
                    <td>${executionTime}</td>
                    <td>${status}</td>
                </tr>
            `;
        });
        $('#scriptDetails').html(scriptDetails);
        $('#scriptModal').modal('show');
    } catch (error) {
        console.error('Error fetching scripts:', error);
    }
});
});

// Filter functionality
$('#riskFilter').on('change', function() {
    var selectedRisk = $(this).val();
    if(selectedRisk === 'all') {
        $('.risk-row').show();
    } else {
        $('.risk-row').hide();
        $('.risk-row[data-risk="' + selectedRisk + '"]').show();
    }
});


function getOSIcon(os) {
switch(os.toLowerCase()) {
    case 'windows': return 'windows';
    case 'linux': return 'linux';
    case 'mac': return 'apple';
    default: return 'desktop';
}
}
