// eventPage.js
// Andrew Benson
// description: code that works in the background at intervals to ping the grades website
// and notify the user through Chrome notifications and UI changes

// the NotificationManager handles all parts of UX i.e. notifications and icon changes
var NotificationManager = {
  onlineNotification: {
    type: "basic",
    title: "251 Grades Currently Online",
    message: "251 grades are accessible right now.",
    iconUrl: "online-big.png"
  },
  offlineNotification: {
    type: "basic",
    title: "251 Grades No Longer Online",
    message: "The website seems to have gone offline.",
    iconUrl: "offline-big.png"
  },
  nextNotificationId: 0,
  notifyOnline: function() {
    // change icon to online
    chrome.browserAction.setIcon({
      path: "online.png"
    });
    // send out notification
    chrome.notifications.create(NotificationManager.nextNotificationId.toString(),
                                NotificationManager.onlineNotification,
                                function() {});
    NotificationManager.nextNotificationId++;
  },
  notifyOffline: function() {
    // change icon to offline
    chrome.browserAction.setIcon({
      path: "offline.png"
    });
    // send out notification
    chrome.notifications.create(NotificationManager.nextNotificationId.toString(),
                                NotificationManager.offlineNotification,
                                function() {});
    NotificationManager.nextNotificationId++;
  }
};

// the WebsitePinger handles all details of figuring out if the website works, and whether
// to notify the user
var WebsitePinger = {
  online: false,
  websiteToPing: "http://www.andrew.cmu.edu/course/15-251/grades/index.html",
  setup: function() {
    this.checksite();
    chrome.alarms.create("myAlarm", {periodInMinutes: 0.1});
  },
  checksite: function() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (this.readyState !== 4) return;
      if (this.status === 0) return;

      var statusLevel = Math.floor(this.status / 100);
      // if HTTP response code is a 400 or 500 level status
      if ((statusLevel === 4 || statusLevel === 5) && WebsitePinger.online) {
        WebsitePinger.online = false;
        NotificationManager.notifyOffline();
      }
      // if HTTP response code is a 200 level status
      else if (statusLevel === 2 && !WebsitePinger.online) {
        WebsitePinger.online = true;
        NotificationManager.notifyOnline();
      }
      // unexpected status code?
      else if (statusLevel !== 2 && statusLevel !== 4 && statusLevel !== 5) {
        console.log("Unexpected HTTP status code: "+this.status.toString());
      }
    };
    xhr.open("get", WebsitePinger.websiteToPing, true);
    xhr.send();
  }
};

WebsitePinger.setup();
chrome.alarms.onAlarm.addListener(function(alarm) {
  WebsitePinger.checksite();
});
