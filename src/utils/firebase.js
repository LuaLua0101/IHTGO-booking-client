import firebase from "firebase/app";
import "@firebase/messaging";
import { notification, Icon } from "antd";
import React from "react";

const openNotification = data => {
  notification.open({
    message: data.title,
    description: data.body,
    icon: <Icon type="message" style={{ color: "#108ee9" }} />
  });
};

var firebaseConfig = {
  messagingSenderId: "612108007368"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// we need to check if messaging is supported by the browser
if (firebase.messaging.isSupported()) {
  let messaging = firebase.messaging();
  messaging.usePublicVapidKey(
    "BNqu2qn7K5GPP11q0qxdgS9ug06NAuxJk-tTDhd8UXAinZ47HSDECn5CQk8rA-Y47Jfn3QXhgOI8ryA7J1YZL1Y"
  );
  messaging
    .requestPermission()
    .then(() => {
      return messaging.getToken();
    })
    .then(token => {
      console.log(token);
      localStorage.setItem("@fcm", token);
      messaging.onMessage(payload => {
        openNotification(payload.notification);
      });
    })
    .catch(err => console.log(err));
}
