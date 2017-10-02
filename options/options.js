function save(event) {
    event.preventDefault();
    const notifications = document.getElementById('notifications');
    const options = browser.storage.sync.set({
        "lympha": {
            "notifications": notifications.checked
        }
    });
}

function restore() {
    const notifications = document.getElementById('notifications');
    const options = browser.storage.sync.get({
        "lympha": {
            "notifications": false
        }
    });
    options.then((res) => {
        notifications.checked = res.lympha.notifications
    });
}


document.addEventListener('DOMContentLoaded', restore);
document.querySelector("form").addEventListener("submit", save);
