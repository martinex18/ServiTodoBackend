const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("../servitodo-47422-firebase-adminsdk-fbsvc-5b439c05fb.json");

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();

module.exports = { db };