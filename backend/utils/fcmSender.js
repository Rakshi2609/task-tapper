// import admin from 'firebase-admin';
// import serviceAccount from './serviceAccountKey.json';

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// export const sendPushNotification = (token, title, body) => {
//   const message = {
//     notification: { title, body },
//     token,
//   };
//   admin.messaging().send(message)
//     .then((res) => console.log("Push sent:", res))
//     .catch((err) => console.error("Push failed:", err));
// };
