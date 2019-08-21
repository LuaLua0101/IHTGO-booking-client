importScripts("https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js");

firebase.initializeApp({
  messagingSenderId: "163319977066"
});

var messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  var notificationTitle = payload.notification.title;
  var notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon
  };

  return messaging.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
