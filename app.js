// app.js - Main Application Logic

// Import Firebase Configuration
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
} from './firebase-config.js';

import { 
    initAuth,
    showAuthModal,
    hideAuthModal,
    showToast,
    uploadImage,
    getUserProfile,
    updateUserProfile
} from './auth.js';

import {
    loadCollections,
    createCollection,
    addToCollection,
    removeFromCollection,
    getCollectionItems
} from './collections.js';

import {
    initAIGenerator,
    generateAI,
    clearAIResults
} from './ai-generator.js';

import {
    loadPhotos,
    loadVideos,
    loadWallpapers,
    searchMedia,
    loadTrending
} from './media-loader.js';

// DOM Elements
const dom = {
    // Loading
    loadingScreen: document.getElementById('loadingScreen'),
    
    // Auth
    authModal: document.getElementById('authModal'),
    closeAuthModal: document.getElementById('closeAuthModal'),
    loginForm: document.getElementById('loginForm'),
    signupForm: document.getElementById('signupForm'),
    loginBtn: document.getElementById('loginBtn'),
    signupBtn: document.getElementById('signupBtn'),
    googleLogin: document.getElementById('googleLogin'),
    githubLogin: document.getElementById('githubLogin'),
    googleSignup: document.getElementById('googleSignup'),
    githubSignup: document.getElementById('githubSignup'),
    switchToSignup: document.querySelector('.switch-to-signup'),
    switchToLogin: document.querySelector('.switch-to-login'),
    
    // Profile
    userProfile: document.getElementById('userProfile'),
    profileDropdown: document.getElementById('profileDropdown'),
    profileAvatar: document.getElementById('profileAvatar'),
    profileName: document.getElementById('profileName'),
    logoutBtn: document.getElementById('logoutBtn'),
    mobileLogoutBtn: document.getElementById('mobileLogoutBtn'),
    
    // Navigation
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileCloseBtn: document.getElementById('mobileCloseBtn'),
    mobileNav: document.getElementById('mobileNav'),
    navLinks: document.querySelectorAll('.nav-link'),
    mobileNavLinks: document.querySelectorAll('.mobile-nav-link'),
    
    // Search
    globalSearch: document.getElementById('globalSearch'),
    globalSearchBtn: document.getElementById('globalSearchBtn'),
    
    // Content Tabs
    contentTabs: document.querySelectorAll('.content-tab'),
    contentSections: document.querySelectorAll('.content-section'),
    
    // Media
    photosGrid: document.getElementById('photosGrid'),
    videosGrid: document.getElementById('videosGrid'),
    wallpapersGrid: document.getElementById('wallpapersGrid'),
    trendingGrid: document.getElementById('trendingGrid'),
    categoriesGrid: document.getElementById('categoriesGrid'),
    
    // Load More
    loadMorePhotos: document.getElementById('loadMorePhotos'),
    loadMoreVideos: document.getElementById('loadMoreVideos'),
    loadMoreWallpapers: document.getElementById('loadMoreWallpapers'),
    
    // Filters
    photoSort: document.getElementById('photoSort'),
    photoOrientation: document.getElementById('photoOrientation'),
    videoSort: document.getElementById('videoSort'),
    videoDuration: document.getElementById('videoDuration'),
    wallpaperSort: document.getElementById('wallpaperSort'),
    wallpaperCategory: document.getElementById('wallpaperCategory'),
    
    // AI Generator
    aiPrompt: document.getElementById('aiPrompt'),
    generateAI: document.getElementById('generateAI'),
    
    // Collections
    collectionsGrid: document.getElementById('collectionsGrid'),
    createCollectionBtn: document.getElementById('createCollectionBtn'),
    createFirstCollection: document.getElementById('createFirstCollection'),
    
    // Modals
    mediaModal: document.getElementById('mediaModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalImage: document.getElementById('modalImage'),
    modalVideo: document.getElementById('modalVideo'),
    modalTitle: document.getElementById('modalTitle'),
    modalAuthorName: document.getElementById('modalAuthorName'),
    modalAuthorAvatar: document.getElementById('modalAuthorAvatar'),
    modalStats: document.getElementById('modalStats'),
    modalTags: document.getElementById('modalTags'),
    modalLikeBtn: document.getElementById('modalLikeBtn'),
    modalDownloadBtn: document.getElementById('modalDownloadBtn'),
    modalCollectionBtn: document.getElementById('modalCollectionBtn'),
    
    // Collection Modals
    collectionModal: document.getElementById('collectionModal'),
    closeCollectionModal: document.getElementById('closeCollectionModal'),
    collectionList: document.getElementById('collectionList'),
    createNewCollectionBtn: document.getElementById('createNewCollectionBtn'),
    
    createCollectionModal: document.getElementById('createCollectionModal'),
    closeCreateCollectionModal: document.getElementById('closeCreateCollectionModal'),
    createCollectionForm: document.getElementById('createCollectionForm'),
    collectionName: document.getElementById('collectionName'),
    collectionDescription: document.getElementById('collectionDescription')
};

// App State
const state = {
    currentUser: null,
    userProfile: null,
    currentMedia: null,
    currentView: 'photos',
    photoPage: 1,
    videoPage: 1,
    wallpaperPage: 1,
    isLoading: false,
    collections: [],
    favorites: [],
    downloads: [],
    aiImages: []
};

// Initialize Application
async function initApp() {
    try {
        // Initialize Firebase Auth
        await initAuth();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load initial content
        await loadInitialContent();
        
        // Hide loading screen
        setTimeout(() => {
            dom.loadingScreen.classList.add('hidden');
        }, 500);
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        showToast('Failed to load application. Please refresh the page.', 'error');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Auth Events
    dom.userProfile.addEventListener('click', toggleProfileDropdown);
    dom.logoutBtn.addEventListener('click', handleLogout);
    dom.mobileLogoutBtn.addEventListener('click', handleLogout);
    dom.closeAuthModal.addEventListener('click', hideAuthModal);
    
    // Navigation Events
    dom.mobileMenuBtn.addEventListener('click', () => {
        dom.mobileNav.classList.add('active');
        document.body.classList.add('modal-open');
    });
    
    dom.mobileCloseBtn.addEventListener('click', () => {
        dom.mobileNav.classList.remove('active');
        document.body.classList.remove('modal-open');
    });
    
    // Nav Links
    dom.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            switchView(target);
        });
    });
    
    dom.mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.classList.contains('logout-btn')) return;
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            switchView(target);
            dom.mobileNav.classList.remove('active');
            document.body.classList.remove('modal-open');
        });
    });
    
    // Content Tabs
    dom.contentTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchView(tabName);
        });
    });
    
    // Search
    dom.globalSearchBtn.addEventListener('click', handleSearch);
    dom.globalSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Load More
    dom.loadMorePhotos.addEventListener('click', () => {
        state.photoPage++;
        loadPhotos(state.photoPage);
    });
    
    dom.loadMoreVideos.addEventListener('click', () => {
        state.videoPage++;
        loadVideos(state.videoPage);
    });
    
    dom.loadMoreWallpapers.addEventListener('click', () => {
        state.wallpaperPage++;
        loadWallpapers(state.wallpaperPage);
    });
    
    // Filters
    dom.photoSort.addEventListener('change', () => {
        state.photoPage = 1;
        dom.photosGrid.innerHTML = '';
        loadPhotos(1);
    });
    
    dom.photoOrientation.addEventListener('change', () => {
        state.photoPage = 1;
        dom.photosGrid.innerHTML = '';
        loadPhotos(1);
    });
    
    dom.videoSort.addEventListener('change', () => {
        state.videoPage = 1;
        dom.videosGrid.innerHTML = '';
        loadVideos(1);
    });
    
    dom.videoDuration.addEventListener('change', () => {
        state.videoPage = 1;
        dom.videosGrid.innerHTML = '';
        loadVideos(1);
    });
    
    dom.wallpaperSort.addEventListener('change', () => {
        state.wallpaperPage = 1;
        dom.wallpapersGrid.innerHTML = '';
        loadWallpapers(1);
    });
    
    dom.wallpaperCategory.addEventListener('change', () => {
        state.wallpaperPage = 1;
        dom.wallpapersGrid.innerHTML = '';
        loadWallpapers(1);
    });
    
    // AI Generator
    dom.generateAI.addEventListener('click', async () => {
        if (!state.currentUser) {
            showAuthModal();
            showToast('Please login to generate AI images', 'info');
            return;
        }
        
        try {
            await generateAI();
        } catch (error) {
            console.error('AI Generation failed:', error);
            showToast('Failed to generate image. Please try again.', 'error');
        }
    });
    
    // Collections
    dom.createCollectionBtn.addEventListener('click', showCreateCollectionModal);
    dom.createFirstCollection.addEventListener('click', showCreateCollectionModal);
    dom.createNewCollectionBtn.addEventListener('click', showCreateCollectionModal);
    
    // Collection Modals
    dom.closeCollectionModal.addEventListener('click', () => {
        dom.collectionModal.classList.remove('active');
        document.body.classList.remove('modal-open');
    });
    
    dom.closeCreateCollectionModal.addEventListener('click', () => {
        dom.createCollectionModal.classList.remove('active');
        document.body.classList.remove('modal-open');
    });
    
    // Create Collection Form
    dom.createCollectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCreateCollection();
    });
    
    // Media Modal
    dom.modalCloseBtn.addEventListener('click', closeMediaModal);
    dom.modalLikeBtn.addEventListener('click', toggleLike);
    dom.modalDownloadBtn.addEventListener('click', downloadMedia);
    dom.modalCollectionBtn.addEventListener('click', showAddToCollectionModal);
    
    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAllModals();
            }
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dom.userProfile.contains(e.target) && !dom.profileDropdown.contains(e.target)) {
            dom.profileDropdown.classList.remove('show');
        }
    });
}

// Load Initial Content
async function loadInitialContent() {
    try {
        // Load trending content
        await loadTrending();
        
        // Load categories
        await loadCategories();
        
        // Load initial media
        await loadPhotos(1);
        await loadVideos(1);
        await loadWallpapers(1);
        
        // Load user collections if logged in
        if (state.currentUser) {
            await loadUserCollections();
        }
        
    } catch (error) {
        console.error('Failed to load initial content:', error);
        showToast('Failed to load content. Please refresh the page.', 'error');
    }
}

// Switch View
function switchView(view) {
    // Update navigation
    dom.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${view}`) {
            link.classList.add('active');
        }
    });
    
    dom.mobileNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${view}`) {
            link.classList.add('active');
        }
    });
    
    // Update content tabs
    dom.contentTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === view) {
            tab.classList.add('active');
        }
    });
    
    // Show corresponding section
    dom.contentSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${view}Section`) {
            section.classList.add('active');
        }
    });
    
    // Update state
    state.currentView = view;
    
    // Scroll to section
    document.getElementById(`${view}Section`).scrollIntoView({
        behavior: 'smooth'
    });
}

// Handle Search
async function handleSearch() {
    const query = dom.globalSearch.value.trim();
    if (!query) return;
    
    try {
        state.isLoading = true;
        
        // Clear current grids
        dom.photosGrid.innerHTML = '';
        dom.videosGrid.innerHTML = '';
        dom.wallpapersGrid.innerHTML = '';
        
        // Reset pagination
        state.photoPage = 1;
        state.videoPage = 1;
        state.wallpaperPage = 1;
        
        // Search across all media types
        await Promise.all([
            searchMedia('photos', query, 1),
            searchMedia('videos', query, 1),
            searchMedia('wallpapers', query, 1)
        ]);
        
        // Switch to photos tab (or first tab with results)
        switchView('photos');
        
        showToast(`Search results for "${query}"`, 'info');
        
    } catch (error) {
        console.error('Search failed:', error);
        showToast('Search failed. Please try again.', 'error');
    } finally {
        state.isLoading = false;
    }
}

// Toggle Profile Dropdown
function toggleProfileDropdown() {
    if (!state.currentUser) {
        showAuthModal();
        return;
    }
    
    dom.profileDropdown.classList.toggle('show');
}

// Handle Logout
async function handleLogout() {
    try {
        await signOut(auth);
        state.currentUser = null;
        state.userProfile = null;
        
        // Update UI
        dom.profileAvatar.innerHTML = '<i class="fas fa-user"></i>';
        dom.profileName.textContent = 'Guest';
        dom.profileDropdown.classList.remove('show');
        
        // Clear user data
        state.collections = [];
        state.favorites = [];
        state.downloads = [];
        
        // Update collections UI
        updateCollectionsUI();
        
        showToast('Logged out successfully', 'success');
        
    } catch (error) {
        console.error('Logout failed:', error);
        showToast('Logout failed. Please try again.', 'error');
    }
}

// Show Create Collection Modal
function showCreateCollectionModal() {
    if (!state.currentUser) {
        showAuthModal();
        showToast('Please login to create collections', 'info');
        return;
    }
    
    dom.collectionName.value = '';
    dom.collectionDescription.value = '';
    dom.createCollectionModal.classList.add('active');
    document.body.classList.add('modal-open');
}

// Handle Create Collection
async function handleCreateCollection() {
    try {
        const name = dom.collectionName.value.trim();
        const description = dom.collectionDescription.value.trim();
        const visibility = document.querySelector('input[name="visibility"]:checked').value;
        
        if (!name) {
            showToast('Collection name is required', 'error');
            return;
        }
        
        const collectionData = {
            name,
            description,
            visibility,
            userId: state.currentUser.uid,
            createdAt: serverTimestamp(),
            itemCount: 0,
            previewImages: []
        };
        
        const collectionRef = await addDoc(collection(db, 'collections'), collectionData);
        
        // Add to local state
        state.collections.push({
            id: collectionRef.id,
            ...collectionData
        });
        
        // Update UI
        updateCollectionsUI();
        
        // Close modal
        dom.createCollectionModal.classList.remove('active');
        document.body.classList.remove('modal-open');
        
        showToast('Collection created successfully', 'success');
        
    } catch (error) {
        console.error('Failed to create collection:', error);
        showToast('Failed to create collection. Please try again.', 'error');
    }
}

// Show Add to Collection Modal
async function showAddToCollectionModal() {
    if (!state.currentUser) {
        showAuthModal();
        showToast('Please login to save to collections', 'info');
        return;
    }
    
    if (!state.currentMedia) return;
    
    try {
        // Load user collections
        await loadUserCollections();
        
        // Clear and populate collection list
        dom.collectionList.innerHTML = '';
        
        if (state.collections.length === 0) {
            dom.collectionList.innerHTML = `
                <div class="empty-collections">
                    <p>No collections found. Create one first!</p>
                </div>
            `;
        } else {
            state.collections.forEach(collection => {
                const collectionItem = document.createElement('div');
                collectionItem.className = 'collection-item';
                collectionItem.innerHTML = `
                    <input type="checkbox" id="collection-${collection.id}" class="collection-checkbox">
                    <label for="collection-${collection.id}" class="collection-label">
                        <i class="fas fa-bookmark"></i>
                        <div>
                            <div class="collection-name">${collection.name}</div>
                            <div class="collection-count-small">${collection.itemCount} items</div>
                        </div>
                    </label>
                `;
                
                // Check if media is already in collection
                const checkbox = collectionItem.querySelector('.collection-checkbox');
                checkbox.checked = collection.items?.some(item => item.mediaId === state.currentMedia.id) || false;
                
                checkbox.addEventListener('change', async (e) => {
                    if (e.target.checked) {
                        await addToCollection(collection.id, state.currentMedia);
                    } else {
                        await removeFromCollection(collection.id, state.currentMedia.id);
                    }
                });
                
                dom.collectionList.appendChild(collectionItem);
            });
        }
        
        dom.collectionModal.classList.add('active');
        document.body.classList.add('modal-open');
        
    } catch (error) {
        console.error('Failed to load collections:', error);
        showToast('Failed to load collections. Please try again.', 'error');
    }
}

// Update Collections UI
function updateCollectionsUI() {
    if (!state.currentUser || state.collections.length === 0) {
        dom.collectionsGrid.innerHTML = `
            <div class="empty-collections">
                <i class="fas fa-bookmark"></i>
                <h3>No Collections Yet</h3>
                <p>Create your first collection to save your favorite content</p>
                <button class="btn btn-primary" id="createFirstCollection">
                    Create Collection
                </button>
            </div>
        `;
        
        // Re-attach event listener
        document.getElementById('createFirstCollection')?.addEventListener('click', showCreateCollectionModal);
        return;
    }
    
    dom.collectionsGrid.innerHTML = '';
    
    state.collections.forEach(collection => {
        const collectionCard = document.createElement('div');
        collectionCard.className = 'collection-card';
        collectionCard.innerHTML = `
            <div class="collection-header">
                <div class="collection-title">
                    <h4>${collection.name}</h4>
                    <span class="collection-count">${collection.itemCount} items</span>
                </div>
                <p class="collection-description">${collection.description || 'No description'}</p>
            </div>
            <div class="collection-preview">
                ${collection.previewImages.slice(0, 3).map(img => 
                    `<img src="${img}" alt="Preview">`
                ).join('')}
                ${collection.previewImages.length < 3 ? 
                    Array(3 - collection.previewImages.length).fill('<div class="empty-preview"></div>').join('') : ''
                }
            </div>
            <div class="collection-footer">
                <span class="collection-visibility">
                    <i class="fas fa-${collection.visibility === 'public' ? 'globe' : 'lock'}"></i>
                    ${collection.visibility}
                </span>
                <div class="collection-actions">
                    <button class="collection-action-btn" data-action="view" data-id="${collection.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="collection-action-btn" data-action="edit" data-id="${collection.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="collection-action-btn" data-action="delete" data-id="${collection.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        dom.collectionsGrid.appendChild(collectionCard);
    });
}

// Toggle Like
async function toggleLike() {
    if (!state.currentUser) {
        showAuthModal();
        showToast('Please login to like content', 'info');
        return;
    }
    
    if (!state.currentMedia) return;
    
    try {
        const isLiked = dom.modalLikeBtn.classList.contains('liked');
        
        if (isLiked) {
            // Remove from favorites
            await removeFromFavorites(state.currentMedia.id);
            dom.modalLikeBtn.classList.remove('liked');
            showToast('Removed from favorites', 'info');
        } else {
            // Add to favorites
            await addToFavorites(state.currentMedia);
            dom.modalLikeBtn.classList.add('liked');
            showToast('Added to favorites', 'success');
        }
        
    } catch (error) {
        console.error('Failed to toggle like:', error);
        showToast('Failed to update favorites. Please try again.', 'error');
    }
}

// Download Media
async function downloadMedia() {
    if (!state.currentMedia) return;
    
    try {
        // Track download in user history
        if (state.currentUser) {
            await addToDownloads(state.currentMedia);
        }
        
        // Create download link
        const link = document.createElement('a');
        link.href = state.currentMedia.downloadUrl || state.currentMedia.url;
        link.download = `quizontal-${state.currentMedia.id}.${state.currentMedia.type === 'video' ? 'mp4' : 'jpg'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Download started', 'success');
        
    } catch (error) {
        console.error('Download failed:', error);
        showToast('Download failed. Please try again.', 'error');
    }
}

// Close Media Modal
function closeMediaModal() {
    dom.mediaModal.classList.remove('active');
    document.body.classList.remove('modal-open');
    
    // Reset modal content
    dom.modalImage.src = '';
    dom.modalVideo.src = '';
    state.currentMedia = null;
}

// Close All Modals
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.classList.remove('modal-open');
}

// Load Categories
async function loadCategories() {
    const categories = [
        { name: 'Nature', query: 'nature', image: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { name: 'People', query: 'people', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { name: 'Technology', query: 'technology', image: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { name: 'Travel', query: 'travel', image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { name: 'Animals', query: 'animals', image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { name: 'Food', query: 'food', image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { name: 'Sports', query: 'sports', image: 'https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?auto=compress&cs=tinysrgb&w=600' },
        { name: 'Abstract', query: 'abstract', image: 'https://images.pexels.com/photos/1025469/pexels-photo-1025469.jpeg?auto=compress&cs=tinysrgb&w=600' }
    ];
    
    dom.categoriesGrid.innerHTML = '';
    
    categories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.innerHTML = `
            <img src="${category.image}" alt="${category.name}">
            <div class="category-overlay">
                <h3>${category.name}</h3>
                <p>Explore ${category.name.toLowerCase()} content</p>
            </div>
        `;
        
        categoryCard.addEventListener('click', () => {
            dom.globalSearch.value = category.query;
            handleSearch();
        });
        
        dom.categoriesGrid.appendChild(categoryCard);
    });
}

// Update User Profile UI
function updateUserProfileUI(user) {
    if (user) {
        // Update avatar
        if (user.photoURL) {
            dom.profileAvatar.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName}">`;
        } else {
            dom.profileAvatar.innerHTML = `<i class="fas fa-user"></i>`;
        }
        
        // Update name
        dom.profileName.textContent = user.displayName || 'User';
        
        // Update dropdown
        const dropdownAvatar = dom.profileDropdown.querySelector('#dropdownAvatar');
        const dropdownName = dom.profileDropdown.querySelector('#dropdownName');
        const dropdownEmail = dom.profileDropdown.querySelector('#dropdownEmail');
        
        if (user.photoURL) {
            dropdownAvatar.innerHTML = `<img src="${user.photoURL}" alt="${user.displayName}">`;
        } else {
            dropdownAvatar.innerHTML = `<i class="fas fa-user"></i>`;
        }
        
        dropdownName.textContent = user.displayName || 'User';
        dropdownEmail.textContent = user.email || '';
        
    } else {
        // Reset to guest state
        dom.profileAvatar.innerHTML = '<i class="fas fa-user"></i>';
        dom.profileName.textContent = 'Guest';
        
        const dropdownAvatar = dom.profileDropdown.querySelector('#dropdownAvatar');
        const dropdownName = dom.profileDropdown.querySelector('#dropdownName');
        const dropdownEmail = dom.profileDropdown.querySelector('#dropdownEmail');
        
        dropdownAvatar.innerHTML = '<i class="fas fa-user"></i>';
        dropdownName.textContent = 'Guest';
        dropdownEmail.textContent = 'Please login';
    }
}

// Add to Favorites
async function addToFavorites(media) {
    try {
        const favoriteRef = await addDoc(collection(db, 'favorites'), {
            userId: state.currentUser.uid,
            mediaId: media.id,
            mediaType: media.type,
            mediaData: media,
            createdAt: serverTimestamp()
        });
        
        state.favorites.push({
            id: favoriteRef.id,
            ...media
        });
        
    } catch (error) {
        console.error('Failed to add to favorites:', error);
        throw error;
    }
}

// Remove from Favorites
async function removeFromFavorites(mediaId) {
    try {
        const favoriteQuery = query(
            collection(db, 'favorites'),
            where('userId', '==', state.currentUser.uid),
            where('mediaId', '==', mediaId)
        );
        
        const favoriteSnapshot = await getDocs(favoriteQuery);
        
        favoriteSnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        
        state.favorites = state.favorites.filter(fav => fav.id !== mediaId);
        
    } catch (error) {
        console.error('Failed to remove from favorites:', error);
        throw error;
    }
}

// Add to Downloads
async function addToDownloads(media) {
    try {
        await addDoc(collection(db, 'downloads'), {
            userId: state.currentUser.uid,
            mediaId: media.id,
            mediaType: media.type,
            mediaData: media,
            downloadedAt: serverTimestamp()
        });
        
    } catch (error) {
        console.error('Failed to track download:', error);
    }
}

// Load User Collections
async function loadUserCollections() {
    if (!state.currentUser) return;
    
    try {
        const collectionsQuery = query(
            collection(db, 'collections'),
            where('userId', '==', state.currentUser.uid)
        );
        
        const collectionsSnapshot = await getDocs(collectionsQuery);
        
        state.collections = [];
        collectionsSnapshot.forEach(doc => {
            state.collections.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        updateCollectionsUI();
        
    } catch (error) {
        console.error('Failed to load collections:', error);
        throw error;
    }
}

// Show Media in Modal
function showMediaModal(media, type) {
    state.currentMedia = { ...media, type };
    
    if (type === 'video') {
        dom.modalImage.style.display = 'none';
        dom.modalVideo.style.display = 'block';
        dom.modalVideo.src = media.video_files?.[0]?.link || media.url;
        dom.modalVideo.load();
    } else {
        dom.modalImage.style.display = 'block';
        dom.modalVideo.style.display = 'none';
        dom.modalImage.src = media.src?.large || media.url;
    }
    
    dom.modalTitle.textContent = media.photographer || media.user?.name || 'Unknown';
    dom.modalAuthorName.textContent = media.photographer || media.user?.name || 'Unknown';
    dom.modalStats.textContent = `${media.likes || 0} likes • ${media.downloads || 0} downloads`;
    
    // Set avatar
    if (media.user?.url) {
        dom.modalAuthorAvatar.innerHTML = `<img src="${media.user.url}" alt="${media.user.name}">`;
    } else {
        dom.modalAuthorAvatar.innerHTML = `<i class="fas fa-user"></i>`;
    }
    
    // Set tags
    dom.modalTags.innerHTML = '';
    if (media.tags) {
        media.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'media-tag';
            tagElement.textContent = `#${tag}`;
            tagElement.addEventListener('click', () => {
                dom.globalSearch.value = tag;
                handleSearch();
            });
            dom.modalTags.appendChild(tagElement);
        });
    }
    
    // Check if liked
    const isLiked = state.favorites.some(fav => fav.id === media.id);
    if (isLiked) {
        dom.modalLikeBtn.classList.add('liked');
    } else {
        dom.modalLikeBtn.classList.remove('liked');
    }
    
    dom.mediaModal.classList.add('active');
    document.body.classList.add('modal-open');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Export for other modules
export {
    dom,
    state,
    showMediaModal,
    closeMediaModal,
    updateUserProfileUI,
    switchView,
    showToast
};
