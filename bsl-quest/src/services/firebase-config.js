import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; //idk if needed
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBY8ndLMA3jg6-kviviEYyQGiTg9JVUc5k",
  authDomain: "bslquest.firebaseapp.com",
  projectId: "bslquest",
  storageBucket: "bslquest.appspot.com",
  messagingSenderId: "942118952638",
  appId: "1:942118952638:web:74d16522477affab3148ef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 

// Initialize Firebase Authentication and get a reference to the service
//const auth = getAuth(app); 
export {db, auth};
export default app; //exporting the app to use in other files
