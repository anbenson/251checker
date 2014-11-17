var pinger = {
  online: false,
  websiteToPing: "http://www.andrew.cmu.edu/course/15-251/grades/index.html",
  notificationOnline: {
    type: "basic",
    title: "251 Grades Currently Online",
    message: "251 grades are accessible right now.",
    iconUrl: "online.png"
  },
  notificationOffline: {
    type: "basic",
    title: "251 Grades No Longer Online",
    message: "The website seems to have gone offline.",
    iconUrl: "offline.png"
  },
  lastNotification: null,
  setup: function() {
    this.checksite();
    chrome.alarms.create("myAlarm", {periodInMinutes: 0.1});
  },
  checksite: function() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState !== 4) return;
      if (this.status === 0) return;

      if (this.status === 404 && pinger.online) {
        pinger.online = false;
        chrome.browserAction.setIcon({
          path: "offline.png"
        });
        if (!pinger.lastNotification) {
          pinger.lastNotification = chrome.notifications.create("251notify", pinger.notificationOffline, function() {});
        }
        else {
          chrome.notifications.update(pinger.lastNotification, pinger.notificationOffline, function() {});
        }
      }

      else if (this.status !== 404 && !pinger.online) {
        pinger.online = true;
        chrome.browserAction.setIcon({
          path: "online.png"
        });
        if (!pinger.lastNotification) {
          pinger.lastNotification = chrome.notifications.create("251notify", pinger.notificationOnline, function() {});
        }
        else {
          chrome.notifications.update(pinger.lastNotification, pinger.notificationOnline, function() {});
        }
      }
    }
    xhr.open("get", this.websiteToPing, true);
    xhr.send();
  }
}

pinger.setup();
chrome.alarms.onAlarm.addListener(function(alarm) {
  pinger.checksite();
});
