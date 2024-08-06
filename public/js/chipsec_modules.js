$(document).ready(function() {
    $('.chipsec-module-btn').click(function () {
        
        // Custom title and message
        const customTitle = 'Started action on endpoint\t🚀';
        let api_url = '';
        let action_name = $(this).attr('id');
        let endpoint_host_id = window.location.href.split("endpoints/")[1].split("/")[0];
        api_url = `/api/chipsec/run/${endpoint_host_id}/${action_name}`;

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
    
    
});});

function showContent(content) {
    document.getElementById('modal-content-box').textContent = atob(content);
    var contentModal = new bootstrap.Modal(document.getElementById('contentModal'));
    contentModal.show();
};