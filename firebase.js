const { initializeApp } = require("firebase/app");
const { getDatabase, ref } = require("firebase/database")

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD06TMNToS3AsOvsy2ZZzJn3vp8GpCx7Yk",
  authDomain: "licenta-84067.firebaseapp.com",
  projectId: "licenta-84067",
  storageBucket: "licenta-84067.appspot.com",
  messagingSenderId: "974771303731",
  appId: "1:974771303731:web:b40005a02a75f047e5ba46"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
exports.dbRef = ref(db);

