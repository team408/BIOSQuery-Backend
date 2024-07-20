$(document).ready(function() {
    $('.dropdown-item').click(function () {
        

        // Custom title and message
        const customTitle = 'Started action on endpoint\t🚀';
        let api_url = '';
        // create custom message based on a switch statement
        let toast_message = '';
        let endpoint_id = $(this).attr('id');
        switch (endpoint_id) {
            case 'install_chipsec':
                toast_message = `Installing Chipsec on host ${this.closest('.card-body').querySelector('.card-title').textContent}`;
                api_url = `/api/chipsec/install/${endpoint_id}`;
                break;
            case 'uninstall_chipsec':
                toast_message = `Uninstalling Chipsec on host ${this.closest('.card-body').querySelector('.card-title').textContent}`;
                api_url = `/api/chipsec/uninstall/${endpoint_id}`;
                break;
            case 'execute_script':
                toast_message = `Executing script on host ${this.closest('.card-body').querySelector('.card-title').textContent}`;
                api_url = `/api/chipsec/run/${endpoint_id}`;
                break;
            default:
                toast_message = '';
        }

        $.ajax({
            url: `/api/chipsec/install/${$(this).closest('.card-body').find('#endpoint_id').text().trim()}`,
            method: 'GET',
            success: function (response) {
                // Handle success response
                const container = document.getElementById('cart-toast-container');
                const targetElement = document.querySelector('[data-kt-docs-toast="stack"]');
                const newToast = targetElement.cloneNode(true);
        
                // Update title and message
                newToast.querySelector('.toast-header strong').textContent = customTitle;
                newToast.querySelector('.toast-body').textContent = toast_message;
        
                container.append(newToast);
                const toast = bootstrap.Toast.getOrCreateInstance(newToast);
                toast.show();
            },
            error: function (error) {
                // Handle error response
                console.log(error);
            }
        });

    });});