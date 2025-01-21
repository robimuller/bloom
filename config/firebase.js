// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    initializeAuth,
    getReactNativePersistence
} from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAFVpRlc0QX1u7CiznGHfZok2rztPcZPEI",
    authDomain: "bloom-3861b.firebaseapp.com",
    projectId: "bloom-3861b",
    storageBucket: "bloom-3861b.appspot.com",
    messagingSenderId: "124272259361",
    appId: "1:124272259361:web:d125954ffe6c818d0d0e60",
    measurementId: "G-QBMMQNH8R6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
