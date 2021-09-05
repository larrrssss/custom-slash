import firebase from 'firebase-admin';

firebase.initializeApp({
  credential: firebase.credential.cert(process.env.FIREBASE_CERT_PATH || '') ,
});

export const db = firebase.firestore();

export const commands = db.collection('commands');