// app.js - Main application file (no ES6 modules)

// Global app state
window.appState = {
    currentView: 'home',
    photos: [],
    videos: [],
    wallpapers: [],
    isLoading: false
};

// Initialize Application
function initApp() {
    console.log("Initializing Quizontal application...");
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial content
    loadInitialContent();
    
    // Hide loading screen
    setTimeout(hideLoadingScreen, 1500);
    
    console.log("Application initialized successfully");
}

// Setup Event Listeners
function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.getAttribute('href').replace('#', '');
            switchView(view);
        });
    });
    
    // Content tabs
    const contentTabs = document.querySelectorAll('.content-tab');
    contentTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const view = this.getAttribute('data-tab');
            switchView(view);
        });
    });
    
    // Search functionality
    const searchBtn = document.getElementById('globalSearchBtn');
    const searchInput = document.getElementById('globalSearch');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') performSearch();
        });
    }
    
    // Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileNav.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (mobileCloseBtn && mobileNav) {
        mobileCloseBtn.addEventListener('click', function() {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Profile dropdown
    const userProfile = document.getElementById('userProfile');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (userProfile && profileDropdown) {
        userProfile.addEventListener('click', function(e) {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            profileDropdown.classList.remove('show');
        });
    }
    
    // Load more buttons
    const loadMorePhotos = document.getElementById('loadMorePhotos');
    if (loadMorePhotos) {
        loadMorePhotos.addEventListener('click', loadMorePhotosFunc);
    }
    
    const loadMoreVideos = document.getElementById('loadMoreVideos');
    if (loadMoreVideos) {
        loadMoreVideos.addEventListener('click', loadMoreVideosFunc);
    }
    
    const loadMoreWallpapers = document.getElementById('loadMoreWallpapers');
    if (loadMoreWallpapers) {
        loadMoreWallpapers.addEventListener('click', loadMoreWallpapersFunc);
    }
    
    // AI Generator
    const generateAI = document.getElementById('generateAI');
    if (generateAI) {
        generateAI.addEventListener('click', generateAIImage);
    }
    
    console.log("Event listeners setup complete");
}

// Switch View
function switchView(view) {
    console.log("Switching to view:", view);
    
    // Update navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${view}`) {
            link.classList.add('active');
        }
    });
    
    // Update content tabs
    const contentTabs = document.querySelectorAll('.content-tab');
    contentTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === view) {
            tab.classList.add('active');
        }
    });
    
    // Show corresponding section
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${view}Section`) {
            section.classList.add('active');
        }
    });
    
    // Update state
    window.appState.currentView = view;
    
    // Load content for the view if needed
    if (view === 'photos' && window.appState.photos.length === 0) {
        loadPhotos();
    } else if (view === 'videos' && window.appState.videos.length === 0) {
        loadVideos();
    } else if (view === 'wallpapers' && window.appState.wallpapers.length === 0) {
        loadWallpapers();
    }
}

// Perform Search
function performSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (!searchInput) return;
    
    const query = searchInput.value.trim();
    if (!query) {
        showToast('Please enter a search term', 'error');
        return;
    }
    
    console.log("Searching for:", query);
    showToast(`Searching for "${query}"...`, 'info');
    
    // For now, just load photos with the search term
    loadPhotos(query);
}

// Load Initial Content
function loadInitialContent() {
    console.log("Loading initial content...");
    
    // Load trending photos
    loadPhotos('nature', 8);
    
    // Load categories
    loadCategories();
    
    // Load some sample content for other sections
    setTimeout(loadSampleVideos, 1000);
    setTimeout(loadSampleWallpapers, 1500);
}

// Load Photos (Pexels API)
function loadPhotos(query = 'nature', perPage = 12) {
    if (window.appState.isLoading) return;
    
    window.appState.isLoading = true;
    console.log("Loading photos...");
    
    // Your Pexels API Key
    const apiKey = 'BaCBEeB2Y1gNaCYddJaRoFaVgCdDNhYu51qQe5JMUcPU56RMiJ5M3FOZ';
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=1`;
    
    fetch(url, {
        headers: {
            'Authorization': apiKey
        }
    })
    .then(response => response.json())
    .then(data => {
        window.appState.photos = data.photos || [];
        displayPhotos(window.appState.photos);
        window.appState.isLoading = false;
        console.log("Photos loaded:", window.appState.photos.length);
    })
    .catch(error => {
        console.error("Error loading photos:", error);
        window.appState.isLoading = false;
        
        // Fallback to sample photos
        loadSamplePhotos();
    });
}

// Display Photos
function displayPhotos(photos) {
    const photosGrid = document.getElementById('photosGrid') || 
                      document.getElementById('trendingGrid') || 
                      document.querySelector('.masonry-grid');
    
    if (!photosGrid) return;
    
    // Clear grid
    photosGrid.innerHTML = '';
    
    // Add photos to grid
    photos.forEach(photo => {
        const photoCard = createPhotoCard(photo);
        photosGrid.appendChild(photoCard);
    });
}

// Create Photo Card
function createPhotoCard(photo) {
    const card = document.createElement('div');
    card.className = 'media-card masonry-item';
    
    card.innerHTML = `
        <img src="${photo.src.medium}" alt="${photo.photographer}" loading="lazy">
        <div class="media-overlay">
            <div class="media-actions">
                <button class="media-action-btn view-btn" onclick="viewPhoto('${photo.id}')">
                    <i class="fas fa-expand"></i> View
                </button>
                <button class="media-action-btn like-btn" onclick="likePhoto('${photo.id}')">
                    <i class="far fa-heart"></i> Like
                </button>
                <button class="media-action-btn download-btn" onclick="downloadPhoto('${photo.src.original}', '${photo.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
        <div class="media-info">
            <div class="author-info">
                <div class="author-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="author-name">${photo.photographer}</div>
            </div>
            <div class="media-stats">
                <i class="far fa-heart"></i> ${photo.likes || Math.floor(Math.random() * 100)}
            </div>
        </div>
    `;
    
    return card;
}

// Load Sample Photos (Fallback)
function loadSamplePhotos() {
    const samplePhotos = [
        {
            id: '1',
            src: {
                medium: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=600',
                original: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg'
            },
            photographer: 'Nature Photographer',
            likes: 245
        },
        {
            id: '2',
            src: {
                medium: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600',
                original: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
            },
            photographer: 'Portrait Artist',
            likes: 189
        },
        {
            id: '3',
            src: {
                medium: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600',
                original: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg'
            },
            photographer: 'Tech Vision',
            likes: 312
        },
        {
            id: '4',
            src: {
                medium: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=600',
                original: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg'
            },
            photographer: 'Travel Enthusiast',
            likes: 156
        }
    ];
    
    window.appState.photos = samplePhotos;
    displayPhotos(samplePhotos);
}

// Load Categories
function loadCategories() {
    const categoriesGrid = document.getElementById('categoriesGrid');
    if (!categoriesGrid) return;
    
    const categories = [
        { name: 'Nature', image: 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=600', query: 'nature' },
        { name: 'People', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600', query: 'people' },
        { name: 'Technology', image: 'https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg?auto=compress&cs=tinysrgb&w=600', query: 'technology' },
        { name: 'Travel', image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=600', query: 'travel' },
        { name: 'Animals', image: 'https://images.pexels.com/photos/247502/pexels-photo-247502.jpeg?auto=compress&cs=tinysrgb&w=600', query: 'animals' },
        { name: 'Food', image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=600', query: 'food' }
    ];
    
    categoriesGrid.innerHTML = '';
    
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
        
        categoryCard.addEventListener('click', function() {
            const searchInput = document.getElementById('globalSearch');
            if (searchInput) {
                searchInput.value = category.query;
                performSearch();
            }
        });
        
        categoriesGrid.appendChild(categoryCard);
    });
}

// Load Sample Videos
function loadSampleVideos() {
    const videosGrid = document.getElementById('videosGrid');
    if (!videosGrid) return;
    
    videosGrid.innerHTML = `
        <div class="video-card">
            <div class="video-thumbnail">
                <img src="https://images.pexels.com/videos/855029/pexels-photo-855029.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Sample Video">
                <button class="video-play-btn">
                    <i class="fas fa-play"></i>
                </button>
                <div class="video-duration">0:30</div>
            </div>
            <div class="video-info">
                <h4>Nature Scene</h4>
                <p>Beautiful nature scenery</p>
            </div>
        </div>
        <div class="video-card">
            <div class="video-thumbnail">
                <img src="https://images.pexels.com/videos/855082/pexels-photo-855082.jpeg?auto=compress&cs=tinysrgb&w=600" alt="Sample Video">
                <button class="video-play-btn">
                    <i class="fas fa-play"></i>
                </button>
                <div class="video-duration">0:45</div>
            </div>
            <div class="video-info">
                <h4>City Time-lapse</h4>
                <p>City lights at night</p>
            </div>
        </div>
    `;
}

// Load Sample Wallpapers
function loadSampleWallpapers() {
    const wallpapersGrid = document.getElementById('wallpapersGrid');
    if (!wallpapersGrid) return;
    
    wallpapersGrid.innerHTML = `
        <div class="wallpaper-card">
            <img src="https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Wallpaper" class="wallpaper-image">
            <div class="wallpaper-resolution">1920x1080</div>
        </div>
        <div class="wallpaper-card">
            <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Wallpaper" class="wallpaper-image">
            <div class="wallpaper-resolution">3840x2160</div>
        </div>
    `;
}

// Load More Photos
function loadMorePhotosFunc() {
    showToast('Loading more photos...', 'info');
    setTimeout(() => {
        loadPhotos('landscape', 8);
    }, 1000);
}

// Load More Videos
function loadMoreVideosFunc() {
    showToast('Loading more videos...', 'info');
}

// Load More Wallpapers
function loadMoreWallpapersFunc() {
    showToast('Loading more wallpapers...', 'info');
}

// Generate AI Image
function generateAIImage() {
    const promptInput = document.getElementById('aiPrompt');
    if (!promptInput) {
        showToast('AI Generator not available', 'error');
        return;
    }
    
    const prompt = promptInput.value.trim();
    if (!prompt) {
        showToast('Please enter a prompt for AI generation', 'error');
        return;
    }
    
    showToast('Generating AI image... This may take a moment.', 'info');
    
    // For now, show a sample AI image
    setTimeout(() => {
        const aiGrid = document.getElementById('aiGrid');
        if (aiGrid) {
            const aiCard = document.createElement('div');
            aiCard.className = 'ai-image-card';
            aiCard.innerHTML = `
                <div class="ai-image-container">
                    <img src="https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="AI Generated">
                    <div class="ai-image-overlay">
                        <div class="ai-image-actions">
                            <button class="ai-action-btn" onclick="viewAIImage(this)">
                                <i class="fas fa-expand"></i> View
                            </button>
                            <button class="ai-action-btn" onclick="downloadAIImage(this)">
                                <i class="fas fa-download"></i> Download
                            </button>
                        </div>
                    </div>
                </div>
                <div class="ai-image-info">
                    <div class="ai-prompt-preview">${prompt.substring(0, 100)}...</div>
                    <div class="ai-image-meta">
                        <span>AI Generated</span>
                        <span>${new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            `;
            aiGrid.appendChild(aiCard);
            
            // Clear empty state if present
            const emptyState = aiGrid.querySelector('.empty-state');
            if (emptyState) {
                emptyState.remove();
            }
            
            showToast('AI image generated successfully!', 'success');
        }
    }, 2000);
}

// View Photo
function viewPhoto(photoId) {
    showToast('Opening photo viewer...', 'info');
    // Implement photo viewer modal
}

// Like Photo
function likePhoto(photoId) {
    if (!window.authState || !window.authState.isAuthenticated) {
        showToast('Please login to like photos', 'error');
        return;
    }
    
    showToast('Photo liked!', 'success');
}

// Download Photo
function downloadPhoto(url, photoId) {
    showToast('Starting download...', 'info');
    
    // Create temporary link for download
    const link = document.createElement('a');
    link.href = url;
    link.download = `quizontal-photo-${photoId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Track download if user is logged in
    if (window.authState && window.authState.isAuthenticated) {
        console.log("Download tracked for user:", window.authState.currentUser.email);
    }
}

// Hide Loading Screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        console.log("Loading screen hidden");
    }
}

// Show Toast Notification (from auth.js but available here too)
window.showToast = function(message, type = 'info') {
    // Use auth.js showToast if available, otherwise create simple one
    if (typeof showToast === 'function') {
        showToast(message, type);
        return;
    }
    
    // Simple toast implementation
    const toast = document.createElement('div');
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
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 3000);
};

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing app...");
    initApp();
});
