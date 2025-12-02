// auth.js - Regular JavaScript (no ES6 modules)

// Global auth state
window.authState = {
    currentUser: null,
    userProfile: null,
    isAuthenticated: false
};

// Initialize Authentication
function initAuth() {
    console.log("Initializing authentication...");
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        console.error("Firebase is not loaded!");
        return;
    }
    
    try {
        // Listen for auth state changes
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                // User is signed in
                window.authState.currentUser = user;
                window.authState.isAuthenticated = true;
                console.log("User signed in:", user.email);
                
                // Update UI
                updateAuthUI(user);
                
                // Load user profile
                loadUserProfile(user.uid);
                
            } else {
                // User is signed out
                window.authState.currentUser = null;
                window.authState.isAuthenticated = false;
                window.authState.userProfile = null;
                console.log("User signed out");
                
                // Update UI
                updateAuthUI(null);
            }
        });
        
        console.log("Authentication initialized successfully");
        
    } catch (error) {
        console.error("Authentication initialization failed:", error);
    }
}

// Update Authentication UI
function updateAuthUI(user) {
    const profileName = document.getElementById('profileName');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (profileName && profileAvatar) {
        if (user) {
            // User is logged in
            profileName.textContent = user.displayName || user.email || 'User';
            
            if (user.photoURL) {
                profileAvatar.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName}">`;
            } else {
                profileAvatar.innerHTML = '<i class="fas fa-user"></i>';
            }
            
            // Show logout option
            const loginBtn = document.querySelector('.login-btn');
            if (loginBtn) {
                loginBtn.textContent = 'Logout';
                loginBtn.onclick = function() {
                    logoutUser();
                };
            }
            
        } else {
            // User is not logged in
            profileName.textContent = 'Guest';
            profileAvatar.innerHTML = '<i class="fas fa-user"></i>';
            
            // Show login option
            const loginBtn = document.querySelector('.login-btn');
            if (loginBtn) {
                loginBtn.textContent = 'Login';
                loginBtn.onclick = function() {
                    showLoginModal();
                };
            }
        }
    }
}

// Show Login Modal
function showLoginModal() {
    // Create modal HTML
    const modalHTML = `
        <div class="modal" id="loginModal" style="display: block;">
            <div class="modal-content">
                <span class="close" onclick="closeLoginModal()">&times;</span>
                <h2>Login to Quizontal</h2>
                <div style="padding: 20px;">
                    <button onclick="loginWithGoogle()" style="width: 100%; padding: 10px; margin: 10px 0; background: #4285F4; color: white; border: none; border-radius: 5px;">
                        <i class="fab fa-google"></i> Sign in with Google
                    </button>
                    <button onclick="loginWithEmail()" style="width: 100%; padding: 10px; margin: 10px 0; background: #6366f1; color: white; border: none; border-radius: 5px;">
                        <i class="fas fa-envelope"></i> Sign in with Email
                    </button>
                    <p style="text-align: center; margin-top: 20px;">Don't have an account? <a href="#" onclick="showSignupModal()">Sign up</a></p>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    modalContainer.id = 'modalContainer';
    document.body.appendChild(modalContainer);
    
    // Add modal styles
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        .modal {
            display: none;
            position: fixed;
            z-index: 9999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        }
        .modal-content {
            background-color: white;
            margin: 15% auto;
            padding: 20px;
            border-radius: 10px;
            width: 90%;
            max-width: 400px;
            position: relative;
        }
        .close {
            position: absolute;
            right: 20px;
            top: 10px;
            font-size: 28px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(modalStyle);
}

// Close Login Modal
function closeLoginModal() {
    const modal = document.getElementById('modalContainer');
    if (modal) {
        modal.remove();
    }
}

// Login with Google
function loginWithGoogle() {
    if (typeof firebase === 'undefined') {
        alert('Firebase is not loaded. Please check your connection.');
        return;
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    
    firebase.auth().signInWithPopup(provider)
        .then(function(result) {
            console.log("Google login successful:", result.user);
            closeLoginModal();
            showToast('Logged in successfully with Google!', 'success');
        })
        .catch(function(error) {
            console.error("Google login error:", error);
            showToast('Login failed: ' + error.message, 'error');
        });
}

// Login with Email
function loginWithEmail() {
    const email = prompt("Enter your email:");
    if (!email) return;
    
    const password = prompt("Enter your password:");
    if (!password) return;
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            console.log("Email login successful:", userCredential.user);
            closeLoginModal();
            showToast('Logged in successfully!', 'success');
        })
        .catch(function(error) {
            console.error("Email login error:", error);
            showToast('Login failed: ' + error.message, 'error');
        });
}

// Show Signup Modal
function showSignupModal() {
    closeLoginModal();
    
    const email = prompt("Enter your email for signup:");
    if (!email) return;
    
    const password = prompt("Enter a password (min 6 characters):");
    if (!password || password.length < 6) {
        alert("Password must be at least 6 characters");
        return;
    }
    
    const name = prompt("Enter your full name:");
    if (!name) return;
    
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(userCredential) {
            // Update profile with name
            return userCredential.user.updateProfile({
                displayName: name
            });
        })
        .then(function() {
            console.log("Signup successful");
            showToast('Account created successfully!', 'success');
        })
        .catch(function(error) {
            console.error("Signup error:", error);
            showToast('Signup failed: ' + error.message, 'error');
        });
}

// Logout User
function logoutUser() {
    if (confirm("Are you sure you want to logout?")) {
        firebase.auth().signOut()
            .then(function() {
                console.log("Logout successful");
                showToast('Logged out successfully!', 'success');
            })
            .catch(function(error) {
                console.error("Logout error:", error);
                showToast('Logout failed: ' + error.message, 'error');
            });
    }
}

// Load User Profile
function loadUserProfile(userId) {
    if (!firebase.firestore) {
        console.warn("Firestore not available for profile loading");
        return;
    }
    
    const db = firebase.firestore();
    db.collection('users').doc(userId).get()
        .then(function(doc) {
            if (doc.exists) {
                window.authState.userProfile = doc.data();
                console.log("User profile loaded:", window.authState.userProfile);
            } else {
                // Create user profile if it doesn't exist
                createUserProfile(userId);
            }
        })
        .catch(function(error) {
            console.error("Error loading user profile:", error);
        });
}

// Create User Profile
function createUserProfile(userId) {
    if (!firebase.firestore) return;
    
    const user = window.authState.currentUser;
    if (!user) return;
    
    const db = firebase.firestore();
    const userData = {
        uid: userId,
        email: user.email,
        displayName: user.displayName || user.email,
        photoURL: user.photoURL || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('users').doc(userId).set(userData)
        .then(function() {
            console.log("User profile created");
            window.authState.userProfile = userData;
        })
        .catch(function(error) {
            console.error("Error creating user profile:", error);
        });
}

// Show Toast Notification
function showToast(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.getElementById('toastNotification');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        max-width: 300px;
        animation: slideIn 0.3s ease;
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(function() {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 3000);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for Firebase to load
    setTimeout(initAuth, 1000);
});
