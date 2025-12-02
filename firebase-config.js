// firebase-config.js - Regular JavaScript (no ES6 modules)

// Your Firebase Configuration - REPLACE WITH YOUR ACTUAL VALUES
const firebaseConfig = {
  apiKey: "AIzaSyDY3xNEt4NIchAGlyGCFENJSA-nNcR78D4",
  authDomain: "quizontal-app.firebaseapp.com",
  projectId: "quizontal-app",
  storageBucket: "quizontal-app.firebasestorage.app",
  messagingSenderId: "579303957522",
  appId: "1:579303957522:web:de120e697f4642287724cb"
};

// Initialize Firebase (makes it globally available)
try {
    // Check if Firebase is already initialized
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully");
    } else {
        console.log("Firebase already initialized");
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// Make services globally available (for backward compatibility)
window.firebaseServices = {
    auth: firebase.auth(),
    firestore: firebase.firestore(),
    storage: firebase.storage(),
    googleProvider: new firebase.auth.GoogleAuthProvider(),
    githubProvider: new firebase.auth.GithubAuthProvider()
};

// Helper function to get services
function getFirebaseService(serviceName) {
    switch(serviceName) {
        case 'auth': return firebase.auth();
        case 'firestore': return firebase.firestore();
        case 'storage': return firebase.storage();
        case 'googleProvider': return new firebase.auth.GoogleAuthProvider();
        case 'githubProvider': return new firebase.auth.GithubAuthProvider();
        default: return null;
    }
}

// Export as global object
window.getFirebaseService = getFirebaseService;
