

function toggleBookmark(tab) {
  var domainStr = extractDomain(tab.url);
  console.log("url -> "+domainStr);
  browser.cookies.getAll({domain: domainStr}, removeCookies);
}

function logCookie(c) {
  console.log("Log "+c);
}

function logError(e) {
  console.error("Error. "+e);
}

function removeCookies(cookies) {
  console.log(cookies.length);
  cookies.forEach((currentCookie, index, array) => {
    console.log("currentCookie.domain "+currentCookie.domain);
    console.log("currentCookie.name "+currentCookie.name);
    var removeCookie = browser.cookies.remove({ url: currentCookie.domain, name: currentCookie.name});
    removeCookie.then(logCookie, logError);
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
