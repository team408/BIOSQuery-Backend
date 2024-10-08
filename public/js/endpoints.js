$(document).ready(function() {
    populateEndpoints();
});

document.addEventListener('DOMContentLoaded', function () {
    // Onliner Util
    document.getElementById("osType-oneliner").onchange = ()=>{
        populateOnliner()
    }
    document.getElementById("oneliner-tab").addEventListener("click", populateOnliner());
});

// oneliner util
function populateOnliner(){
    const code = document.getElementById("oneliner-code");
    code.innerHTML='<a class="text-info">Loading oneliner...</a>'
    const osType = document.getElementById("osType-oneliner").value
    const apiUrl = "/api/agents/add/oneliner/" + osType;
    $.ajax(apiUrl).done(function(data) {
        code.innerHTML = '<a style="color: orange">#/bin/bash</a>\n' + data
    })
    .fail(function(error) {
        // If the promise fails
        code.innerHTML ='<a class="text-danger">Error fetching oneliner.</a>'
    // Onliner Util
    document.getElementById("osType-oneliner").onchange = ()=>{
        populateOnliner()
    }
    document.getElementById("oneliner-tab").addEventListener("click", populateOnliner());
});

// oneliner util
function populateOnliner(){
    const code = document.getElementById("oneliner-code");
    code.innerHTML='<a class="text-info">Loading oneliner...</a>'
    const osType = document.getElementById("osType-oneliner").value
    const apiUrl = "/api/agents/add/oneliner/" + osType;
    $.ajax(apiUrl).done(function(data) {
        code.innerHTML = '<a style="color: orange">#/bin/bash</a>\n' + data
    })
    .fail(function(error) {
        // If the promise fails
        code.innerHTML ='<a class="text-danger">Error fetching oneliner.</a>'
    });
}

// SSH add form util 
}

// SSH add form util 
document.getElementById('authMeth').addEventListener('change', function() {
    var authMeth = this.value;
    var credentialsSection = document.getElementById('credentials');
    var privateKeySection = document.getElementById('privateKeySection');
    if (authMeth === 'pass') {
        credentialsSection.style.display = 'block';
        privateKeySection.style.display = 'none';
    } else if (authMeth === 'key') {
        credentialsSection.style.display = 'none';
        privateKeySection.style.display = 'block';
    }
});

document.getElementById('defaultKeyCheckbox').addEventListener('change', function() {
    var privateKeyInput = document.getElementById('privateKey');
    if (this.checked) {
        privateKeyInput.disabled = true;
    } else {
        privateKeyInput.disabled = false;
    }
});

// Populate endpoint cards with data
function populateEndpoints(_callback){
    const $endpointsDivRow = $('#endpointsDivRow');
    if(!$endpointsDivRow){
        return
    }
    const apiUrl = "/api/endpoints/all"
    $.getJSON(apiUrl).done(function(data) {
        $endpointsDivRow.empty(); // Clear existing endpoints
        if(!data.length){
            $endpointsDivRow.append('<a class="text-danger">No endpoints found</a>');
        } 
        else{
            data.forEach(function (endpoint) {
                let colDiv = document.createElement("div");
                const singleEndpoint = data.length == 1;
                if (!singleEndpoint)
                    colDiv.className = "col-md-3 g-3";
                else
                    colDiv.className = "cust-grid-col";
                
                let platformLogo;
                switch (endpoint.platform) {
                    case "rhel":
                        platformLogo = "/img/rhel_logo.png";
                        break;
                    case "kali":
                        platformLogo = "/img/kali_logo.png";
                        break;
                    case "ubuntu":
                        platformLogo = "/img/ubuntu_logo.png";
                        break;
                    case "debian":
                        platformLogo = "/img/debian_logo.png";
                        break;
                    case "windows":
                        platformLogo = "/img/windows_logo.png";
                        break;
                    case "centos":
                        platformLogo = "/img/centos_logo.png";
                        break;
                    case "macos":
                        platformLogo = "/img/macos_logo.png";
                        break;
                    default:
                        platformLogo = "/img/generic_logo.png";
                        break;
                }

                let body = `
                <input type="checkbox" class="endpoint-checkbox select-endpoints" data-endpoint-id="${endpoint.id}">
                <a href="/endpoints/${endpoint.id}">
                <h5 id="endpoint_hostname" class="card-title m-0 ml-2">
                    <img src="${platformLogo}" class="card-img-top" alt="${endpoint.platform} logo">
                    ${endpoint.hostname}
                </h5>
                </a>

                <p class="card-text"><strong>IP:</strong> ${endpoint.primary_ip}</p>
                <p class="card-text"><strong>MAC:</strong> ${endpoint.primary_mac}</p>
                <p class="card-text"><strong>OS:</strong> ${endpoint.os_version}</p>
                <p class="card-text"><strong>Uptime:</strong> ${(endpoint.uptime / (1000 * 60 * 60 * 24)).toFixed(2)} days</p>
                <p class="card-text"><strong>Last Seen:</strong> ${endpoint.formatted_last_seen}</p>
                <p class="card-text"><strong>Last Scan:</strong> 
                    ${endpoint.formatted_last_scan && endpoint.formatted_last_scan !== '1/1/1970, 00:00:00' ? endpoint.formatted_last_scan : 'N/A'}
                </p>
                <p id="endpoint_id" hidden class="endpointID">${endpoint.id}</p>
                <div class="dropdown position-absolute" style="top: 2px; right: 10px;">
                    <button class="btn dropdown-toggle custom-dropdown" type="button" id="dropdownMenuButton${endpoint.uuid}" data-bs-toggle="dropdown" aria-expanded="false">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-horizontal" viewBox="0 0 16 16">
                            <path d="M13 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M6 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                        </svg>
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${endpoint.uuid}">
                        ${endpoint.chipsec ? `
                            <li><a id="execute_script" class="dropdown-item" href="#">Execute a script</a></li>
                            <li><a id="run_module" class="dropdown-item" href="/endpoints/<%= endpoint.id %>">Run a chipsec module</a></li>
                            <li><a id="uninstall_chipsec" class="dropdown-item" href="#">Uninstall chipsec</a></li>
                            <li><a id="delete_host" class="dropdown-item" href="#">Delete host</a></li>`: `
                            <li><a id="install_chipsec" class="dropdown-item" href="#">Install chipsec</a></li>
                            <li><a id="delete_host" class="dropdown-item" href="#">Delete host</a></li>`
                        }
                    </ul>
                </div>


                `
                
            
            let cardFooter = document.createElement("div");
            cardFooter.className = "card-footer"
            let cardFooterContent = document.createElement("div");
            cardFooterContent.className = "text-muted chipsec-status";
            endpoint.chipsec ? cardFooterContent.textContent = "✅ Chipsec installed" : cardFooterContent.textContent = "⛔ Chipsec isn't installed";
            cardFooter.appendChild(cardFooterContent);
            
            let cardBody = document.createElement("div");
            cardBody.className = "card-body fixed-size-card";
            cardBody.innerHTML = body;
            let cardDiv = document.createElement("div");
            cardDiv.className = "card fixed-sized-card";
            cardDiv.appendChild(cardBody);
            cardDiv.appendChild(cardFooter);
            colDiv.appendChild(cardDiv);
            $endpointsDivRow.append(colDiv);
            });
            document.getElementById("div-action-buttons").style.display = "block";
            populateDropdownActions()
            populateCheckboxUtils()
        };
    })
    .fail(function(error) {
        $endpointsDivRow.empty(); // Clear existing endpoints
        $endpointsDivRow.append('<a class="text-danger">Error fetching endpoints.</a>');
    });
};

function populateCheckboxUtils(){
    // Dev note: From Gaia's branch
    document.addEventListener('DOMContentLoaded', function () {
    const checkboxes = document.querySelectorAll('.endpoint-checkbox');
    const deleteSelectedBtn = document.getElementById('deleteSelected');
    const installChipsecSelectedBtn = document.getElementById('installChipsecSelected');
    
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
            // handle delete action
            console.log('Deleting selected endpoints:', selectedIds);
        });

    installChipsecSelectedBtn.addEventListener('click', () => {
        const selectedCheckboxes = document.querySelectorAll('.endpoint-checkbox:checked');
        const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.uuid);
        // handle install chipsec action
        console.log('Installing CHIPSEC on selected endpoints:', selectedIds);
    });
});
}

function populateDropdownActions(){
    // Dropdownlist actions
    $('.dropdown-item').click(function () {
        // Custom title and message
        const customTitle = 'Started action on endpoint\t🚀';
        let api_url = '';
        // create custom message based on a switch statement
        let toast_message = '';
        let action_name = $(this).attr('id');
        let endpoint_host_id = $(this).closest('.card-body').find('#endpoint_id').text().trim()
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
                    // Handle success response
                    const container = document.getElementById('toast-container');
                    const targetElement = document.querySelector('[data-kt-docs-toast="stack"]');
                    const newToast = targetElement.cloneNode(true);
                    
                    // Update title and message
                    newToast.classList.add('toast-success');
                    newToast.querySelector('.toast-header strong').textContent = customTitle;
                    newToast.querySelector('.toast-body').textContent = response.result;
            
                    container.append(newToast);
                    const toast = bootstrap.Toast.getOrCreateInstance(newToast);
                    toast.show();
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
                }
            });       
        }
    });
}