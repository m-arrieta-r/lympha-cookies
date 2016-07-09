
var count = 0;
var cookiesLength = 0;
function toggle(tab) {
  var domainStr = extractDomain(tab.url);
  console.log("domainStr "+domainStr);
  browser.cookies.getAll({domain: domainStr}, removeCookies);
}

function notify(count) {
  //console.log("background script received message");
  var title = browser.i18n.getMessage("notificationTitle");
  var content = browser.i18n.getMessage("notificationContent", count);
  browser.notifications.create({
    "type": "basic",
    "iconUrl": browser.extension.getURL("data/icon.png"),
    "title": title,
    "message": content
  });
}

function logError(e) {
  console.error("Error. "+e);
}

function notifyCokiesRemoved(cookie) {
  count = (c !== null)?count+1:count;
  if(cookiesLength === count) {
    notify(count.toString());
  }
}

function removeCookie(cookie, index, array) {
  count = 0;
  var url = (cookie.secure)?"https://"+cookie.domain:"https://"+cookie.domain;
  var removeCookie = browser.cookies.remove({ url: url, name: cookie.name, storeId: cookie.storeId});
  removeCookie.then(notifyCokiesRemoved, logError);
}

function removeCookies(cookies) {
  cookiesLength = cookies.length;
  cookies.forEach(removeCookie);
  if(cookiesLength == 0){
    notify(cookiesLength.toString());
  }
}

function hasProtocol(url) {
  return (url.indexOf("://") > -1);
}

function extractDomain(url) {
    var domain;
    var urlSplitted = url.split('/');
    //find & remove protocol (http, ftp, etc.) and get domain
    domain =  (hasProtocol(url)) ? urlSplitted[2] : urlSplitted[0];
    //find & remove port number
    domain = domain.split(':')[0];
    return domain.replace("www.", "");
}

function contextMenusClicked(info, tab) {
 if (info.menuItemId == "lympha-ctx-btn") {
   toggle(tab);
 }
}

function commandsClicked(command) {
  if (command == "toggle-feature") {
    browser.tabs.query({active: true}, (tabArray) => {
      toggle(tabArray[0]);
    });
  }
}

function init() {
  browser.contextMenus.create({
    id: "lympha-ctx-btn",
    title: chrome.i18n.getMessage("lymphaCtxBtn"),
    contexts: ["all"]
  });
  browser.contextMenus.onClicked.addListener(contextMenusClicked);
  browser.browserAction.onClicked.addListener(toggle);
  browser.commands.onCommand.addListener(commandsClicked);
}

init();
