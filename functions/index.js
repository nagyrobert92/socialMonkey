const functions = require("firebase-functions");
const admin = require("firebase-admin");

var serviceAccount = require("./socialape-85aee-firebase-adminsdk-e2ul1-5bc1451084.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://socialape-85aee.firebaseio.com"
});
const firebaseConfig = {
  apiKey: "AIzaSyDPD2JEG0yNgDxc9_iYuxhnvHhE8ZczUDc",
  authDomain: "socialape-85aee.firebaseapp.com",
  databaseURL: "https://socialape-85aee.firebaseio.com",
  projectId: "socialape-85aee",
  storageBucket: "socialape-85aee.appspot.com",
  messagingSenderId: "223529044541",
  appId: "1:223529044541:web:19f04dc0f3b90abe"
};

const db = admin.firestore();
const express = require("express");
const app = express();

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

app.get("/screams", (req, res) => {
  db.collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(screams);
    })
    .catch(err => console.error(err));
});

app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };
  db.collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({ message: `document ${doc.id} created succesfully` });
    })
    .catch(err => {
      res.status(500).json({ error: "something went wrong" });
      console.log(err);
    });
});

//Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email already in use" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

exports.api = functions.region("europe-west1").https.onRequest(app);
