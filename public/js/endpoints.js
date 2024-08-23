$(document).ready(function() {
    populateEndpoints();
});

function populateEndpoints(){
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
                let body = `<a href="/endpoints/${endpoint.id}"><img src="${platformLogo}" class="card-img-top platform-img"></a>
                            <h5 id="endpoint_hostname" class="card-title">
                                ${endpoint.hostname}
                            </h5>
                            <p class="card-text">
                                <strong>IP:</strong> ${endpoint.primary_ip}
                            </p>
                            <p class="card-text">
                                <strong>MAC:</strong> ${endpoint.primary_mac}
                            </p>
                            <p class="card-text">
                                <strong>OS:</strong> ${endpoint.os_version}
                            </p>
                            <p class="card-text">
                                <strong>Uptime:</strong> ${(endpoint.uptime / (1000 * 60 * 60 * 24)).toFixed(2)} days
                            </p>
                            <p class="card-text">
                                <strong>Last Seen:</strong> ${endpoint.formatted_last_seen}
                            </p>
                            <p class="card-text">
                                <strong>Last Scan:</strong>
                                ${endpoint.formatted_last_scan && endpoint.formatted_last_scan !== '1/1/1970, 00:00:00' ? endpoint.formatted_last_scan : 'N/A'}
                            </p>
                            <p id="endpoint_id" hidden class="endpointID">
                                ${endpoint.id}
                            </p>
                            <!-- Dropdown menu -->
                            <div class="dropdown position-absolute" style="top: 10px; right: 10px;">
                                <button class="btn dropdown-toggle custom-dropdown" type="button" id="dropdownMenuButton${endpoint.uuid}" data-bs-toggle="dropdown" aria-expanded="false">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                                        <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                                    </svg>
                                </button>
                                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton${endpoint.uuid}">
                                    ${endpoint.chipsec ? `<li><a id="execute_script" class="dropdown-item" href="#">Execute a script</a></li>
                                        <li><a id="run_module" class="dropdown-item" href="/endpoints/<%= endpoint.id %>">Run a chipsec module</a></li>
                                        <li><a id="uninstall_chipsec" class="dropdown-item" href="#">Uninstall chipsec</a></li>
                                        <li><a id="delete_host" class="dropdown-item" href="#">Delete host</a></li>`
                                    :
                                        `<li><a id="install_chipsec" class="dropdown-item" href="#">Install chipsec</a></li>
                                        <li><a id="delete_host" class="dropdown-item" href="#">Delete host</a></li>`
                                    }}
                                </ul>
                            </div>
                `
                let cardFooter = document.createElement("div");
                cardFooter.className = "card-footer"
                let cardFooterContent = document.createElement("div");
                cardFooterContent.className = "text-muted chipsec-status";
                endpoint.chipsec ? cardFooterContent.textContent = "✅ Chipsec installed" : cardFooterContent.textContent = "⛔ Chipsec isn't installed";
                cardFooter.appendChild(cardFooterContent);
                
                // Assembeling
                let cardBody = document.createElement("div");
                cardBody.className = "card-body";
                cardBody.innerHTML = body;
                let cardDiv = document.createElement("div");
                cardDiv.className = "card fixed-sized-card";
                cardDiv.appendChild(cardBody);
                cardDiv.appendChild(cardFooter);
                colDiv.appendChild(cardDiv);
                $endpointsDivRow.append(colDiv);
            });
        };
    })
    .fail(function(error) {
        // If the promise fails
        $endpointsDivRow.empty(); // Clear existing endpoints
        $endpointsDivRow.append('<a class="text-danger">Error fetching endpoints.</a>');
    });
};