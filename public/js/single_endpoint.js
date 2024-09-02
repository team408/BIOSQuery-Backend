$(document).ready(function() {
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
            
    }});});

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
        // handle delete action
    });

    installChipsecSelectedBtn.addEventListener('click', () => {
        const selectedCheckboxes = document.querySelectorAll('.endpoint-checkbox:checked');
        const selectedIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.uuid);
        // handle install chipsec action
    });
});


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

addNodeForm.addEventListener('submit', function(event) {
    event.preventDefault();
    var osType = document.getElementById('osType').value;
    var hostId = document.getElementById('hostId').value;
    var authMeth = document.getElementById('authMeth').value;
    var data = { osType: osType, hostId: hostId};
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
        }
        else {
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
        if (response.ok){
            // Handle success response
            const container = document.getElementById('toast-container');
            const targetElement = document.querySelector('[data-kt-docs-toast="stack"]');
            const newToast = targetElement.cloneNode(true);

            // Update title and message
            newToast.classList.add('toast-success');
            newToast.querySelector('.toast-header strong').textContent = 'Started action on endpoint\t🚀';
            newToast.querySelector('.toast-body').textContent = response.result;

            container.append(newToast);
            const toast = bootstrap.Toast.getOrCreateInstance(newToast);
            toast.show();
        }
        else{
            const container = document.getElementById('toast-container');
            const targetElement = document.querySelector('[data-kt-docs-toast="stack"]');            
            const newToast = targetElement.cloneNode(true);

            newToast.classList.add('toast-error');
            newToast.querySelector('.toast-header strong').textContent = 'Action Failed';
            newToast.querySelector('.toast-body').textContent = 'An error occurred. Please try again.';

            container.append(newToast);
            const toast = bootstrap.Toast.getOrCreateInstance(newToast);
            toast.show();

        }
    }).catch((error) => {
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
    });
    document.getElementById('addNodeModal').ariaHidden = true;
});