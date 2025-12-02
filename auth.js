// auth.js - Authentication Management

import { 
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
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from './firebase-config.js';

import { dom, state, updateUserProfileUI, showToast } from './app.js';

// Initialize Authentication
export async function initAuth() {
    try {
        // Listen for auth state changes
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                state.currentUser = user;
                
                // Load user profile
                await loadUserProfile(user.uid);
                
                // Update UI
                updateUserProfileUI({
                    ...user,
                    ...state.userProfile
                });
                
                // Load user data
                await loadUserData(user.uid);
                
                showToast('Welcome back!', 'success');
                
            } else {
                // User is signed out
                state.currentUser = null;
                state.userProfile = null;
                
                // Update UI
                updateUserProfileUI(null);
                
                // Clear user data
                state.collections = [];
                state.favorites = [];
                state.downloads = [];
            }
        });
        
        // Setup auth event listeners
        setupAuthListeners();
        
    } catch (error) {
        console.error('Auth initialization failed:', error);
        throw error;
    }
}

// Setup Auth Event Listeners
function setupAuthListeners() {
    // Login Form
    dom.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });
    
    // Signup Form
    dom.signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSignup();
    });
    
    // Google Login/Signup
    dom.googleLogin.addEventListener('click', () => handleGoogleAuth());
    dom.googleSignup.addEventListener('click', () => handleGoogleAuth());
    
    // GitHub Login/Signup
    dom.githubLogin.addEventListener('click', () => handleGitHubAuth());
    dom.githubSignup.addEventListener('click', () => handleGitHubAuth());
    
    // Switch between login/signup
    dom.switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('signup');
    });
    
    dom.switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchAuthTab('login');
    });
    
    // Password toggle
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Avatar upload preview
    const avatarInput = document.getElementById('signupAvatar');
    const avatarPreview = document.getElementById('avatarPreview');
    
    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Handle Login
async function handleLogin() {
    try {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        // Show loading state
        const btnText = dom.loginBtn.querySelector('.btn-text');
        const btnLoading = dom.loginBtn.querySelector('.btn-loading');
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        
        // Sign in with email and password
        await signInWithEmailAndPassword(auth, email, password);
        
        // Hide auth modal
        hideAuthModal();
        
        // Reset form
        dom.loginForm.reset();
        
    } catch (error) {
        console.error('Login failed:', error);
        showToast(getAuthErrorMessage(error), 'error');
    } finally {
        // Reset button state
        const btnText = dom.loginBtn.querySelector('.btn-text');
        const btnLoading = dom.loginBtn.querySelector('.btn-loading');
        btnText.style.display = 'flex';
        btnLoading.style.display = 'none';
    }
}

// Handle Signup
async function handleSignup() {
    try {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const avatarFile = document.getElementById('signupAvatar').files[0];
        
        if (!name || !email || !password) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        if (password.length < 6) {
            showToast('Password must be at least 6 characters', 'error');
            return;
        }
        
        // Show loading state
        const btnText = dom.signupBtn.querySelector('.btn-text');
        const btnLoading = dom.signupBtn.querySelector('.btn-loading');
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Upload avatar if provided
        let avatarUrl = '';
        if (avatarFile) {
            avatarUrl = await uploadAvatar(userCredential.user.uid, avatarFile);
        }
        
        // Create user profile in Firestore
        await createUserProfile(userCredential.user.uid, {
            displayName: name,
            email: email,
            photoURL: avatarUrl,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp()
        });
        
        // Update auth profile
        await userCredential.user.updateProfile({
            displayName: name,
            photoURL: avatarUrl
        });
        
        // Hide auth modal
        hideAuthModal();
        
        // Reset form
        dom.signupForm.reset();
        dom.avatarPreview.innerHTML = '<i class="fas fa-user"></i>';
        
    } catch (error) {
        console.error('Signup failed:', error);
        showToast(getAuthErrorMessage(error), 'error');
    } finally {
        // Reset button state
        const btnText = dom.signupBtn.querySelector('.btn-text');
        const btnLoading = dom.signupBtn.querySelector('.btn-loading');
        btnText.style.display = 'flex';
        btnLoading.style.display = 'none';
    }
}

// Handle Google Authentication
async function handleGoogleAuth() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        // Check if user profile exists
        const userProfile = await getUserProfile(user.uid);
        
        if (!userProfile) {
            // Create new user profile
            await createUserProfile(user.uid, {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                provider: 'google',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            });
        } else {
            // Update last login
            await updateUserProfile(user.uid, {
                lastLogin: serverTimestamp()
            });
        }
        
        hideAuthModal();
        showToast('Signed in with Google', 'success');
        
    } catch (error) {
        console.error('Google auth failed:', error);
        showToast(getAuthErrorMessage(error), 'error');
    }
}

// Handle GitHub Authentication
async function handleGitHubAuth() {
    try {
        const result = await signInWithPopup(auth, githubProvider);
        const user = result.user;
        
        // Check if user profile exists
        const userProfile = await getUserProfile(user.uid);
        
        if (!userProfile) {
            // Create new user profile
            await createUserProfile(user.uid, {
                displayName: user.displayName || user.email,
                email: user.email,
                photoURL: user.photoURL,
                provider: 'github',
                createdAt: serverTimestamp(),
                lastLogin: serverTimestamp()
            });
        } else {
            // Update last login
            await updateUserProfile(user.uid, {
                lastLogin: serverTimestamp()
            });
        }
        
        hideAuthModal();
        showToast('Signed in with GitHub', 'success');
        
    } catch (error) {
        console.error('GitHub auth failed:', error);
        showToast(getAuthErrorMessage(error), 'error');
    }
}

// Create User Profile
export async function createUserProfile(userId, profileData) {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, profileData);
        
        // Update local state
        state.userProfile = profileData;
        
    } catch (error) {
        console.error('Failed to create user profile:', error);
        throw error;
    }
}

// Get User Profile
export async function getUserProfile(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            return userDoc.data();
        }
        return null;
        
    } catch (error) {
        console.error('Failed to get user profile:', error);
        throw error;
    }
}

// Update User Profile
export async function updateUserProfile(userId, updateData) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, updateData);
        
        // Update local state
        if (state.userProfile) {
            state.userProfile = { ...state.userProfile, ...updateData };
        }
        
    } catch (error) {
        console.error('Failed to update user profile:', error);
        throw error;
    }
}

// Upload Avatar
export async function uploadAvatar(userId, file) {
    try {
        const storageRef = storage.ref();
        const avatarRef = storageRef.child(`avatars/${userId}/${file.name}`);
        
        await avatarRef.put(file);
        const downloadUrl = await avatarRef.getDownloadURL();
        
        return downloadUrl;
        
    } catch (error) {
        console.error('Failed to upload avatar:', error);
        throw error;
    }
}

// Upload Image
export async function uploadImage(file, folder = 'uploads') {
    try {
        if (!state.currentUser) {
            throw new Error('User not authenticated');
        }
        
        const storageRef = storage.ref();
        const imageRef = storageRef.child(`${folder}/${state.currentUser.uid}/${Date.now()}_${file.name}`);
        
        await imageRef.put(file);
        const downloadUrl = await imageRef.getDownloadURL();
        
        return downloadUrl;
        
    } catch (error) {
        console.error('Failed to upload image:', error);
        throw error;
    }
}

// Load User Profile
async function loadUserProfile(userId) {
    try {
        const profile = await getUserProfile(userId);
        state.userProfile = profile;
        
    } catch (error) {
        console.error('Failed to load user profile:', error);
    }
}

// Load User Data
async function loadUserData(userId) {
    try {
        // Load user collections
        await loadUserCollections(userId);
        
        // Load user favorites
        await loadUserFavorites(userId);
        
        // Load user downloads
        await loadUserDownloads(userId);
        
    } catch (error) {
        console.error('Failed to load user data:', error);
    }
}

// Load User Collections
async function loadUserCollections(userId) {
    // Implement collection loading
}

// Load User Favorites
async function loadUserFavorites(userId) {
    // Implement favorites loading
}

// Load User Downloads
async function loadUserDownloads(userId) {
    // Implement downloads loading
}

// Switch Auth Tab
function switchAuthTab(tab) {
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(tabEl => {
        tabEl.classList.remove('active');
        if (tabEl.getAttribute('data-tab') === tab) {
            tabEl.classList.add('active');
        }
    });
    
    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    document.getElementById(`${tab}Form`).classList.add('active');
}

// Show Auth Modal
export function showAuthModal(tab = 'login') {
    dom.authModal.classList.add('active');
    document.body.classList.add('modal-open');
    
    if (tab === 'signup') {
        switchAuthTab('signup');
    } else {
        switchAuthTab('login');
    }
}

// Hide Auth Modal
export function hideAuthModal() {
    dom.authModal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

// Get Auth Error Message
function getAuthErrorMessage(error) {
    switch (error.code) {
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/user-disabled':
            return 'User account is disabled';
        case 'auth/user-not-found':
            return 'User not found';
        case 'auth/wrong-password':
            return 'Incorrect password';
        case 'auth/email-already-in-use':
            return 'Email already in use';
        case 'auth/weak-password':
            return 'Password is too weak';
        case 'auth/operation-not-allowed':
            return 'Operation not allowed';
        case 'auth/too-many-requests':
            return 'Too many requests. Try again later';
        case 'auth/popup-closed-by-user':
            return 'Login popup was closed';
        case 'auth/cancelled-popup-request':
            return 'Login cancelled';
        default:
            return 'Authentication failed. Please try again';
    }
}

// Show Toast Notification
export function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'exclamation-circle';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            break;
    }
    
    toast.innerHTML = `
        <i class="fas fa-${icon} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Add close event
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}
