const admin = require("firebase-admin");

var serviceAccount = require("../socialape-85aee-firebase-adminsdk-e2ul1-5bc1451084.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "socialape-85aee.appspot.com"
});

const db = admin.firestore();

module.exports = { admin, db };
