const admin = require("firebase-admin");
const functions = require("firebase-functions");
const firebase = require("firebase");
const firebaseConfig = {
  apiKey: "AIzaSyC6j7tPsFw47i1XOm9wAE2e9RlPIU-8Sy4",
  authDomain: "u-app-3100e.firebaseapp.com",
  projectId: "u-app-3100e",
  storageBucket: "u-app-3100e.appspot.com",
  messagingSenderId: "273373943578",
  appId: "1:273373943578:web:9e3eedc3457651b56f7ea3",
  measurementId: "G-SS6QNPCNWV",
};
var serviceAccount = require("../key.json");


//Local
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://u-app-3100e.firebaseio.com"
});
//Local

//Online
// admin.initializeApp(functions.config().firebase);
//Online

firebase.initializeApp(firebaseConfig);
let db = admin.firestore();

module.exports = { admin, db, functions, firebase, firebaseConfig };


