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

const express = require("express");
const app = express();

const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);

app.get("/screams", (req, res) => {
  admin
    .firestore()
    .collection("screams")
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
  admin
    .firestore()
    .collection("screams")
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
  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then(data => {
      return res
        .status(201)
        .json({ message: `user ${data.user.uid} signed up succesfully` });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.region("europe-west1").https.onRequest(app);
