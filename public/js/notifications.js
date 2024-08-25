const closeEnvelope = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope" viewBox="0 0 16 16"><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"></path></svg>`
const openEnvelope = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-paper" viewBox="0 0 16 16"><path d="M4 0a2 2 0 0 0-2 2v1.133l-.941.502A2 2 0 0 0 0 5.4V14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5.4a2 2 0 0 0-1.059-1.765L14 3.133V2a2 2 0 0 0-2-2zm10 4.267.47.25A1 1 0 0 1 15 5.4v.817l-1 .6zm-1 3.15-3.75 2.25L8 8.917l-1.25.75L3 7.417V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1zm-11-.6-1-.6V5.4a1 1 0 0 1 .53-.882L2 4.267zm13 .566v5.734l-4.778-2.867zm-.035 6.88A1 1 0 0 1 14 15H2a1 1 0 0 1-.965-.738L8 10.083zM1 13.116V7.383l4.778 2.867L1 13.117Z"></path></svg>`
function fetchNotifications(scope) {
    const $notificationList = $('#notification-list');
    $notificationList.empty(); // Clear existing notifications
    const loadingImg = document.createElement("img");
    loadingImg.src = "/img/loading.gif";
    loadingImg.style = `width: 25%; display: block; margin: auto; margin-top:10%`;
    const loadingDiv = document.createElement("div");
    loadingDiv.appendChild(loadingImg);
    $notificationList.append(loadingDiv)
    let apiUrl = `/api/notifications/${scope}`;

    //Fetching
    $.getJSON(apiUrl).done(function(data) {
        $notificationList.empty(); // Clear loading img
        data.forEach(notification => {
            const isRead = notification.read;
            const notificationClass = isRead ? 'list-group-item-light' : 'list-group-item-info';
            const readSvgFalse = `<button type="button" name="notification-read-button" data-read="unread" data-id=${notification._id} class="btn btn-info">${closeEnvelope}</button>`
            const readSvgTrue = `<button type="button" name="notification-read-button" data-read="read" data-id=${notification._id} class="btn btn-secondary">${openEnvelope}</button>`
            const svgRead = isRead ? readSvgTrue : readSvgFalse;

            const notificationItem = `
                <li class="list-group-item ${notificationClass}" id="${notification._id}">
                    <a style="display: inline-block">
                        ${svgRead}<h5>${notification.title}</h5><p>${notification.desc}</p>
                    </a>
                </li>
            `;
            $notificationList.append(notificationItem);
        });
        setButtonsOnclicks();
    })
    .fail(function(error) {
        // If the promise fails
        console.error("Error fetching notifications:", error);
        const $notificationList = $('#notification-list');
        $notificationList.html('<li class="list-group-item text-danger">Failed to load notifications.</li>');
    });
}

const readBoolStrDict = {"read": "unread", "unread": "read"};

function setButtonsOnclicks(){
    const buttonsCollection = document.getElementsByName("notification-read-button");
    buttonsCollection.forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const readBoolStr = readBoolStrDict[this.getAttribute('data-read')];
            let notificationClass;
            let buttonClass
            let tmpSvg;
            sendRequest(id, readBoolStr)
            if (readBoolStr === "read"){
                tmpSvg = openEnvelope
                notificationClass = 'list-group-item list-group-item-light';
                buttonClass = 'btn btn-secondary';
            }else{
                tmpSvg = closeEnvelope;
                notificationClass = 'list-group-item list-group-item-info';
                buttonClass = 'btn btn-info';
            }
            button.innerHTML = tmpSvg;
            button.setAttribute("data-read", readBoolStr);
            button.setAttribute("class", buttonClass);
            document.getElementById(id).setAttribute("class", notificationClass);
        });
    });
}

function sendRequest(id, readBoolStr) {
    const url = `/api/notifications/${id}/${readBoolStr}`; 
    fetch(url, {
        method: 'GET'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        return true
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        return false;
    });
}