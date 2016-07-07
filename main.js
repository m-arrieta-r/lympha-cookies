
var count = 0;
function toggleBookmark(tab) {
  var domainStr = extractDomain(tab.url);
  browser.cookies.getAll({domain: domainStr}, removeCookies);
}

function notify(count) {
  //console.log("background script received message");
  var title = chrome.i18n.getMessage("notificationTitle");
  var content = chrome.i18n.getMessage("notificationContent", count);
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

function removeCookies(cookies) {
  count = 0;
  if(cookies.length === 0) {
    notify("0");
  }
  cookies.forEach((cookie, index, array) => {
    var url = (cookie.secure)?"https://"+cookie.domain:"https://"+cookie.domain;
    var removeCookie = browser.cookies.remove({ url: url, name: cookie.name, storeId: cookie.storeId});
    removeCookie.then((c)=> {
      count = (c !== null)?count+1:count;
      if(cookies.length === count) {
        notify(count.toString());
      }
    }, logError);
  });

}


function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    } else {
        domain = url.split('/')[0];
    }
    //find & remove port number
    domain = domain.split(':')[0];
    return domain.replace("www.", "");
}

browser.browserAction.onClicked.addListener(toggleBookmark);
