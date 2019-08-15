const functions = require("firebase-functions");

const FBAuth = require("./util/fbAuth");
const app = require("express")();

const { getAllScreams, postOneScream } = require("./handlers/screams");
const { signup, login, uploadImage } = require("./handlers/users");

//Scream routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);

//users routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", FBAuth, uploadImage);

exports.api = functions.region("europe-west1").https.onRequest(app);
