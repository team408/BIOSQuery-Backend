$(document).ready(function() {
    function showContent(content) {
        document.getElementById('modal-content-box').textContent = atob(content);
        var contentModal = new bootstrap.Modal(document.getElementById('contentModal'));
        contentModal.show();
    }
});