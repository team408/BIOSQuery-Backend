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