$(document).ready(function () {
    populateEndpoints();

    $('.dropdown-item').click(function () {
        const customTitle = 'Started action on endpoint\t🚀';
        let api_url = '';
        let action_name = $(this).attr('id');
        let endpoint_host_id = $(this).closest('.card-body').find('#endpoint_id').text().trim();
        switch (action_name) {
            case 'install_chipsec':
                api_url = `/api/chipsec/install/${endpoint_host_id}`;
                break;
            case 'uninstall_chipsec':
                api_url = `/api/chipsec/uninstall/${endpoint_host_id}`;
                break;
            case 'delete_host':
                api_url = `/api/agents/rmNode/${endpoint_host_id}`;
                break;
            default:
                return;
        }

        if (api_url !== '') {
            $.ajax({
                url: api_url,
                method: 'GET',
                success: function (response) {
                    showToast(customTitle, response.result, 'success');
                },
                error: function (error) {
                    showToast('Action Failed', 'An error occurred. Please try again.', 'error');
                    console.log(error);
                }
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const checkboxes = document.querySelectorAll('.endpoint-checkbox');
    const deleteSelectedBtn = document.getElementById('deleteSelected');
    const installChipsecSelectedBtn = document.getElementById('installChipsecSelected');
    const addNodeForm = document.getElementById('addNodeForm');

    checkboxes.forEach(checkbox => {
        checkbox.disabled = false;
        checkbox.addEventListener('change', () => {
            const selectedCheckboxes = document.querySelectorAll('.endpoint-checkbox:checked');
            deleteSelectedBtn.disabled = selectedCheckboxes.length === 0;
            installChipsecSelectedBtn.disabled = selectedCheckboxes.length === 0;
        });
    });

    deleteSelectedBtn.addEventListener('click', () => {
        const selectedCheckboxes = document.querySelectorAll('.endpoint-checkbox:checked');
        const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.uuid);
        console.log('Deleting selected endpoints:', selectedIds);
    });

    installChipsecSelectedBtn.addEventListener('click', () => {
        const selectedCheckboxes = document.querySelectorAll('.endpoint-checkbox:checked');
        const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.uuid);
        console.log('Installing CHIPSEC on selected endpoints:', selectedIds);
    });

    addNodeForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var osType = document.getElementById('osType').value;
        var hostId = document.getElementById('hostId').value;
        var authMeth = document.getElementById('authMeth').value;
        var data = { osType: osType, hostId: hostId };
        var username = document.getElementById('username').value;
        data.username = username;

        if (authMeth === 'pass') {
            var password = document.getElementById('password').value;
            data.password = password;
        } else if (authMeth === 'key') {
            var useDefaultKey = document.getElementById('defaultKeyCheckbox').checked;
            if (!useDefaultKey) {
                var privateKey = document.getElementById('privateKey').value;
                data.privateKey = privateKey;
            } else {
                data.privateKey = "default";
            }
        }

        fetch('/api/agents/addNode/' + osType + "/" + hostId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    showToast('Started action on endpoint\t🚀', response.result, 'success');
                } else {
                    showToast('Action Failed', 'An error occurred. Please try again.', 'error');
                }
            }).catch((error) => {
                showToast('Action Failed', 'An error occurred. Please try again.', 'error');
                console.log(error);
            });
    });
});

function populateEndpoints() {
    const $endpointsDivRow = $('#endpointsDivRow');
    const $deleteSelected = $('#deleteSelected');
    const $installChipsecSelected = $('#installChipsecSelected');
    
    if (!$endpointsDivRow) {
        return;
    }
    
    const apiUrl = "/api/endpoints/all";
    $.getJSON(apiUrl).done(function (data) {
        $endpointsDivRow.empty();
        
        if (!data.length) {
            $endpointsDivRow.append('<a class="text-danger">No endpoints found</a>');
        } else {
            data.forEach(function (endpoint) {
                let colDiv = document.createElement("div");
                const singleEndpoint = data.length === 1;
                colDiv.className = singleEndpoint ? "card fixed-sized-card" : "card-body";
                let platformLogo = getPlatformLogo(endpoint.platform);

                let body = `
                    <input type="checkbox" class="endpoint-checkbox select-endpoints" data-endpoint-id="${endpoint.id}">
                    <a href="/endpoints/${endpoint.id}"><img src="${platformLogo}" class="card-img-top"></a>
                    <h5 id="endpoint_hostname" class="card-title">${endpoint.hostname}</h5>
                    <p class="card-text"><strong>IP:</strong> ${endpoint.primary_ip}</p>
                    <p class="card-text"><strong>MAC:</strong> ${endpoint.primary_mac}</p>
                    <p class="card-text"><strong>OS:</strong> ${endpoint.os_version}</p>
                    <p class="card-text"><strong>Uptime:</strong> ${(endpoint.uptime / (1000 * 60 * 60 * 24)).toFixed(2)} days</p>
                    <p class="card-text"><strong>Last Seen:</strong> ${endpoint.formatted_last_seen}</p>
                    <p class="card-text"><strong>Last Scan:</strong> 
                    ${endpoint.formatted_last_scan && endpoint.formatted_last_scan !== '1/1/1970, 00:00:00' ? endpoint.formatted_last_scan : 'N/A'}</p>
                    <p id="endpoint_id" hidden class="endpointID">${endpoint.id}</p>
                    <div class="dropdown position-absolute" style="top: 10px; right: 10px;">
                        <button class="btn dropdown-toggle custom-dropdown" type="button" id="dropdownMenuButton${endpoint.uuid}" data-bs-toggle="dropdown" aria-expanded="false">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                            </svg>
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${endpoint.uuid}">
                            ${getEndpointMenu(endpoint.chipsec, endpoint.id)}
                        </ul>
                    </div>
                `;

                let cardFooter = document.createElement("div");
                cardFooter.className = "card-footer";
                let cardFooterContent = document.createElement("div");
                cardFooterContent.className = "text-muted chipsec-status";
                cardFooterContent.textContent = endpoint.chipsec ? "✅ Chipsec installed" : "⛔ Chipsec isn't installed";
                cardFooter.appendChild(cardFooterContent);

                let cardBody = document.createElement("div");
                cardBody.className = "card-body";
                cardBody.innerHTML = body;
                let cardDiv = document.createElement("div");
                cardDiv.className = "card fixed-size-card";
                cardDiv.appendChild(cardBody);
                cardDiv.appendChild(cardFooter);
                colDiv.appendChild(cardDiv);
                $endpointsDivRow.append(colDiv);
            });

            $('.endpoint-checkbox').on('change', function() {
                updateButtonsState();
            });
        }
    }).fail(function (error) {
        $endpointsDivRow.empty();
        let noEndpointsAlert = `<a class="text-danger">No endpoints found</a>`;
        $endpointsDivRow.append(noEndpointsAlert);
        console.log(error);
    });

    function updateButtonsState() {
        const selectedCount = $('.endpoint-checkbox:checked').length;
        $deleteSelected.prop('disabled', selectedCount === 0);
        $installChipsecSelected.prop('disabled', selectedCount === 0);
    }
}

function getPlatformLogo(platform) {
    let platformLogo = "https://via.placeholder.com/100";
    switch (platform) {
        case "windows":
            platformLogo = "https://img.icons8.com/color/96/windows-11.png";
            break;
        case "linux":
            platformLogo = "https://img.icons8.com/color/96/linux--v1.png";
            break;
        case "mac":
            platformLogo = "https://img.icons8.com/officel/96/mac-logo.png";
            break;
    }
    return platformLogo;
}

function getEndpointMenu(chipsecInstalled, endpointId) {
    if (chipsecInstalled) {
        return `
            <li><a class="dropdown-item" id="uninstall_chipsec">Uninstall CHIPSEC</a></li>
            <li><a class="dropdown-item text-danger" id="delete_host">Delete Endpoint</a></li>
        `;
    } else {
        return `
            <li><a class="dropdown-item" id="install_chipsec">Install CHIPSEC</a></li>
            <li><a class="dropdown-item text-danger" id="delete_host">Delete Endpoint</a></li>
        `;
    }
}

function showToast(title, message, type) {
    const toastId = 'toast-' + Math.random().toString(36).substr(2, 9);
    const toast = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="3000">
            <div class="toast-header ${type === 'success' ? 'bg-success text-white' : 'bg-danger text-white'}">
                <strong class="me-auto">${title}</strong>
                <small>Just now</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;
    $('#toast-container').append(toast);
    const newToast = new bootstrap.Toast(document.getElementById(toastId));
    newToast.show();
}
