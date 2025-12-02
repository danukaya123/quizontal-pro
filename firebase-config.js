// firebase-config.js

// Your Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDY3xNEt4NIchAGlyGCFENJSA-nNcR78D4",
  authDomain: "quizontal-app.firebaseapp.com",
  projectId: "quizontal-app",
  storageBucket: "quizontal-app.firebasestorage.app",
  messagingSenderId: "579303957522",
  appId: "1:579303957522:web:de120e697f4642287724cb"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Initialize Providers
const googleProvider = new firebase.auth.GoogleAuthProvider();
const githubProvider = new firebase.auth.GithubAuthProvider();

// Firebase Functions
const signInWithEmailAndPassword = firebase.auth.signInWithEmailAndPassword;
const createUserWithEmailAndPassword = firebase.auth.createUserWithEmailAndPassword;
const signInWithPopup = firebase.auth.signInWithPopup;
const signOut = firebase.auth.signOut;
const onAuthStateChanged = firebase.auth.onAuthStateChanged;

// Firestore Functions
const collection = firebase.firestore.collection;
const addDoc = firebase.firestore.addDoc;
const getDocs = firebase.firestore.getDocs;
const getDoc = firebase.firestore.getDoc;
const updateDoc = firebase.firestore.updateDoc;
const deleteDoc = firebase.firestore.deleteDoc;
const doc = firebase.firestore.doc;
const query = firebase.firestore.query;
const where = firebase.firestore.where;
const orderBy = firebase.firestore.orderBy;
const limit = firebase.firestore.limit;
const serverTimestamp = firebase.firestore.serverTimestamp;
const setDoc = firebase.firestore.setDoc;

export {
    auth,
    db,
    storage,
    googleProvider,
    githubProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    setDoc
};
