let options;
let count = 0;

function toggle(tab) {
    const domainStr = extractDomain(tab.url);

    console.log("domainStr " + domainStr);
    browser.cookies.getAll({
        domain: domainStr
    }, removeCookies);
}

function notify(count) {
    clearTimeout();
    browser.browserAction.setBadgeText({text: `-${count.toString()}`});
    setTimeout( () => {
        browser.browserAction.setBadgeText({text: ''});
    }, 2500);

    if (options.lympha.notifications) {
        const title = browser.i18n.getMessage("notificationTitle");
        const content = browser.i18n.getMessage("notificationContent", count.toString());

        browser.notifications.create('lympha-notification', {
            "type": "basic",
            "iconUrl": browser.extension.getURL("data/icon.png"),
            "title": title,
            "message": content
        });
    }

}

function logError(e) {
    console.error("Error. " + e);
}

function removeCookie(cookie, index, array) {
    const protocol = (cookie.secure) ? "https://" : "http://";
    const url = protocol + cookie.domain
    const removeCookie = browser.cookies.remove({
        url: url,
        name: cookie.name,
        storeId: cookie.storeId
    });

    removeCookie.then((cookie) => {
        const isTheLastOne = array.length === index + 1;
        if (cookie) {
            count++;
        }
        if (isTheLastOne) {
            notify(count.toString());
        }
    }, logError);
}

function removeCookies(cookies) {
    count = 0;

    if (cookies.length === 0) {
        notify(cookies.length);
    } else {
        cookies.forEach(removeCookie);
    }
}

function hasProtocol(url) {
    return (url.indexOf("://") > -1);
}

function extractDomain(url) {
    let domain;
    const urlSplitted = url.split('/');
    //find & remove protocol (http, ftp, etc.) and get domain
    domain = (hasProtocol(url)) ? urlSplitted[2] : urlSplitted[0];
    //find & remove port number
    domain = domain.split(':')[0];
    return domain.replace("www.", "");
}

function contextMenusClicked(info, tab) {
    if (info.menuItemId === "lympha-ctx-btn") {
        toggle(tab);
    }
}

function commandsClicked(command) {
    if (command === "toggle-feature") {
        browser.tabs.query({
            active: true
        }, (tabArray) => {
            toggle(tabArray[0]);
        });
    }
}

function loadOptions() {
    let gettingOptions = browser.storage.sync.get({
        "lympha": {
            "notifications": false
        }
    });
    gettingOptions.then((obj) => {
        options = obj;
    });
}

function onStorageChange(changes, area) {
    const changedItems = Object.keys(changes);

    for (var item of changedItems) {
        if (item === 'lympha') {
            loadOptions();
        }
    }
}

function init() {
    loadOptions();
    browser.contextMenus.create({
        id: "lympha-ctx-btn",
        title: chrome.i18n.getMessage("lymphaCtxBtn"),
        contexts: ["all"]
    });

    browser.storage.onChanged.addListener(onStorageChange);
    browser.contextMenus.onClicked.addListener(contextMenusClicked);
    browser.browserAction.onClicked.addListener(toggle);
    browser.commands.onCommand.addListener(commandsClicked);
}

init();
