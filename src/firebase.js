
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, child, get, update } = require ('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyA5VWstG2YzbfYJDOvSbkTrIH4k8H16wWM",
  authDomain: "tenderproject-3f1cd.firebaseapp.com",
  databaseURL: "https://tenderproject-3f1cd-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tenderproject-3f1cd",
  storageBucket: "tenderproject-3f1cd.appspot.com",
  messagingSenderId: "535584326076",
  appId: "1:535584326076:web:1f246fae666898d18bebb9"
};

const app = initializeApp(firebaseConfig);

const dbRef = ref(getDatabase(app));

async function getData(path) {
  return await get(child(dbRef, path)).then(data => data.exists() ? data.val() : '');
}
  
async function setData(updates) {
  return await update(dbRef, updates).then(() => true);
}



module.exports = { getData, setData };