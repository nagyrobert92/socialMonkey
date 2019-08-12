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
let errors = {};

const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const isEmpty = string => {
  if (string.trim() === "") return true;
  else return false;
};
//Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  if (isEmpty(newUser.email)) {
    errors.email = "Email must be not empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email adress";
  }
  if (isEmpty(newUser.password)) errors.password = "Must not be empty";
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (isEmpty(newUser.handle)) errors.handle = "Must not be empty";
  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  // data validation
  let token, userId;
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
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
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

app.post("/login", (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };
  let errors = {};

  if (isEmpty(user.email)) errors.email = "Must be not empty";
  if (isEmpty(user.password)) errors.password = "Must be not empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === "auth/worng-password") {
        return res
          .status(403)
          .json({ general: "Wrong credentials, try again" });
      } else return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.region("europe-west1").https.onRequest(app);
