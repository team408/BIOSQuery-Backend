$(document).ready(function () {
    const searchForm = document.getElementById('searchForm');

    // Add an event listener for the form submission
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission

        // Get the search query entered by the user
        const searchQuery = searchForm.elements.search.value;

        // Redirect the user to the desired URL with the search query
        window.location.href = `/endpoints?search=${encodeURIComponent(searchQuery)}`;
    });
});