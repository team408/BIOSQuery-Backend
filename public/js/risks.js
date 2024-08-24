$(document).ready(function() {
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

    function fillStatus(status) {
        if (status === 'ran') {
            return '<span class="badge badge-success"> Success </span>';
        } else {
            return '<span class="badge badge-warning"> Failed </span>';
        }
    }

    // Info button click event
    $('.info-btn').click(function () {
        const hostId = $(this).data('host-id');

        if (!hostId) {
            console.error('Host ID is not defined.');
            return;
        }

        // Show modal with loading indicator
        $('#scriptModal').modal('show');
        $('#loadingIndicator').removeClass('d-none');
        $('#scriptTable').addClass('d-none');
        $('#scriptDetails').empty(); // Clear any previous content

        api_url = `/api/risks/${hostId}`;

        $.ajax({
            url: api_url,
            method: 'GET',
            success: function (response) {
                let scriptDetails = '';
                let scriptNames = Object.keys(response);
                scriptNames.forEach(function (scriptName) {
                    const script = scriptName.slice(0, -3); // Remove the .sh extension
                    const status = response[scriptName].status;
                    const executionTime = formatDate(response[scriptName].execution_time);
                    scriptDetails += `
                        <tr>
                            <td>${script}</td>
                            <td>${executionTime}</td>
                            <td>${fillStatus(status)}</td>
                        </tr>
                    `;
                });

                // Hide loading indicator and show the table
                $('#loadingIndicator').addClass('d-none');
                $('#scriptTable').removeClass('d-none');
                $('#scriptDetails').html(scriptDetails);
            },
            error: function (error) {
                const container = document.getElementById('toast-container');
                const targetElement = document.querySelector('[data-kt-docs-toast="stack"]');
                const newToast = targetElement.cloneNode(true);

                newToast.classList.add('toast-error');
                newToast.querySelector('.toast-header strong').textContent = 'Action Failed';
                newToast.querySelector('.toast-body').textContent = 'An error occurred. Please try again.';

                container.append(newToast);
                const toast = bootstrap.Toast.getOrCreateInstance(newToast);
                toast.show();

                console.log(error);

                // Hide loading indicator if error occurs
                $('#loadingIndicator').addClass('d-none');
            }
        });
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
