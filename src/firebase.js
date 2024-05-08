import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyB_le2t60dI_oe3Gy2EOOimxwVmHrnkmd8",
    authDomain: "shopping-cart-63da2.firebaseapp.com",
    projectId: "shopping-cart-63da2",
    storageBucket: "shopping-cart-63da2.appspot.com",
    messagingSenderId: "172227153263",
    appId: "1:172227153263:web:93869287c84e3e16936c9a"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const auth = firebase.auth();
export const firestore = firebase.firestore();