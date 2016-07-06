/* Deprecated file, use sdk and chrome, now the functionality
 * is replaced with webextensions.
 */

// jshint moz:true, esnext: true
let { Cc, Ci } = require('chrome');
const tabs = require("sdk/tabs");
const self = require('sdk/self');
const { ActionButton } = require("sdk/ui/button/action");
const urls = require("sdk/url");
const windows = require('sdk/windows').browserWindows;
const { viewFor } = require("sdk/view/core");
const { Hotkey } = require("sdk/hotkeys");
const notifications = require("sdk/notifications");

var showHotKey = Hotkey({
  combo: "accel-shift-l",
  onPress: function() {
    removeCookiesFromCurrentPage();
  }
});

var button = ActionButton({
    id: "lympha-btn",
    label: "Lympha",
    icon: {
      "16": "./favicon.ico",
      "32": "./favicon.ico"
    },
    onClick: state => {
        removeCookiesFromCurrentPage();
    }
});

const removeCookiesFromCurrentPage = () => {
    var currentHost = getURLManager().host;
    removeCookiesFrom(currentHost.replace("www.", ""));
};

const getURLManager = () => {
    var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    //if is url
    return ioService.newURI(tabs.activeTab.url, null, null);
};

const removeCookiesFrom = (strTest) => {
    var cookieManager = Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager);
    var enumerator = cookieManager.enumerator;
    var regex = new RegExp(strTest);
    var numCookiesRemoved = 0;
    while(enumerator.hasMoreElements()) {
        var cookie = enumerator.getNext();
        if (cookie instanceof Ci.nsICookie) {
            if(regex.test(cookie.host)) {
                //console.log("Cookies Removed--> " + cookie.host);
                cookieManager.remove(cookie.host, cookie.name, cookie.path, cookie.blocked);
                numCookiesRemoved++;
            }
        }
    }
    notifications.notify({
        title: "Lympha",
        text: numCookiesRemoved + " cookie(s) removed",
        iconURL: self.data.url('icon.png')
    });
};

const appendChildToContextMenu = (browserDocument, label) => {
    const contextMenu = browserDocument.getElementById('contentAreaContextMenu');
    var menuitem = browserDocument.createElement("menuitem");
    menuitem.setAttribute('label', label);
    menuitem.setAttribute('class', "menuitem-iconic");
    menuitem.setAttribute('image', self.data.url('favicon.ico'));
    contextMenu.appendChild(menuitem);
    return menuitem;
};

const initMenu = (win) => {
    const browserDocument = win.document;
    var menuitem = appendChildToContextMenu(browserDocument, "Remove cookies");
    menuitem.addEventListener('click', () => {
        removeCookiesFromCurrentPage();
        //console.log("removeCookiesFromCurrentPage");
    });
    //console.log("obj:P");
};

// Init an instance when a new window is opened
//windows.on('open', initWin);

// Init new instances on startup
Array.from(windows).forEach(sdkWin => {
  initMenu(viewFor(sdkWin));
});

// to see how to test this function, look at test/test-index.js
function dummy(text, callback) {
  callback(text);
}

exports.dummy = dummy;
