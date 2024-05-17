import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFhHZvr0anlsVsN8enFbo4VSgDRi8_4dU",
  authDomain: "estate-connect-app-d4dbb.firebaseapp.com",
  projectId: "estate-connect-app-d4dbb",
  storageBucket: "estate-connect-app-d4dbb.appspot.com",
  messagingSenderId: "279460726677",
  appId: "1:279460726677:web:cc550d1693177d4521189c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore()