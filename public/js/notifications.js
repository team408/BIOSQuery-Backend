$(document).ready(function() {
    // Example URL - replace with your API endpoint
    const apiUrl = '/api/notifications/all';

    function fetchNotifications() {
        $.getJSON(apiUrl).done(function(data) {
            const $notificationList = $('#notification-list');
            $notificationList.empty(); // Clear existing notifications

            data.forEach(notification => {
                const isRead = notification.read;
                const notificationClass = isRead ? 'list-group-item-light' : 'list-group-item-info';
                const svgRead = isRead ? "/svg/mail-open.svg" : "/svg/mail-close.svg";

                const notificationItem = `
                    <li class="list-group-item ${notificationClass}">
                        <object style="display: inline-block" width="4%" data="${svgRead}" type="image/svg+xml"></object>
                        <a style="display: inline-block"><h5>${notification.title}</h5><p>${notification.desc}</p></a>
                    </li>
                `;
                $notificationList.append(notificationItem);
            });
        })
        .fail(function(error) {
            // If the promise fails
            console.error("Error fetching notifications:", error);
            const $notificationList = $('#notification-list');
            $notificationList.html('<li class="list-group-item text-danger">Failed to load notifications.</li>');
        });
    }

    // Fetch notifications when the page loads
    fetchNotifications();
});