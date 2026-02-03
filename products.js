// products.js - Load and display products from Google Sheets

// Toast notification function
function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;

    // Add to body
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 1500);
}

// Add toast styles to document
function addToastStyles() {
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 16px 24px;
                border-radius: 50px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                z-index: 10000;
                display: flex;
                align-items: center;
                gap: 12px;
                transform: translateX(400px);
                transition: transform 0.3s ease;
            }

            .toast-notification.show {
                transform: translateX(0);
            }

            .toast-notification.success {
                border-left: 4px solid #C9A961;
            }

            .toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .toast-notification i {
                color: #C9A961;
                font-size: 1.3rem;
            }

            .toast-notification span {
                color: #2C1810;
                font-weight: 600;
                font-size: 0.95rem;
            }

            @media (max-width: 768px) {
                .toast-notification {
                    right: 10px;
                    left: 10px;
                    top: 10px;
                    border-radius: 15px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Function to load products from Google Sheets
async function loadProducts() {
    try {
        const response = await fetch('https://opensheet.elk.sh/15wr4ZZbQEA1dDQIdALdmFW2Cjmt1nlJ9woiSPNBnhOA/products');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        
        // Log the raw data to see what we're getting
        console.log('Raw data from Google Sheets:', products);
        
        if (!products || products.length === 0) {
            console.warn('No products returned from Google Sheets');
            return [];
        }
        
        // Transform the data - Google Sheets returns all values as strings
        const transformedProducts = products.map(product => {
            // Handle different possible column name formats
            return {
                id: parseInt(product.id || product.ID) || 0,
                name: product.name || product.Name || '',
                category: product.category || product.Category || '',
                description: product.description || product.Description || '',
                price: parseFloat(product.price || product.Price) || 0,
                unit: product.unit || product.Unit || '',
                image: product.image || product.Image || 'img/default.jpg',
                featured: product.featured === 'TRUE' || product.featured === 'true' || product.featured === '1' || product.featured === 1 || product.featured === true,
                favorite: product.favorite === 'TRUE' || product.favorite === 'true' || product.favorite === '1' || product.favorite === 1 || product.favorite === true
            };
        });
        
        console.log('Transformed products:', transformedProducts);
        
        return transformedProducts;
    } catch (error) {
        console.error('Error loading products:', error);
        console.error('Error details:', error.message);
        return [];
    }
}

// Function to display all products on the shop page
async function displayProducts(containerId = 'products-container') {
    const products = await loadProducts();
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('Container not found');
        return;
    }
    
    if (products.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p>No products available. Please check your Google Sheets data.</p></div>';
        return;
    }
    
    container.innerHTML = ''; // Clear existing content
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        container.innerHTML += productCard;
    });
}

// Function to create HTML for a single product card
function createProductCard(product) {
    return `
        <div class="col-md-6 col-lg-6 col-xl-4">
            <div class="rounded position-relative fruite-item">
                <div class="fruite-img">
                    <img src="${product.image}" class="img-fluid w-100 rounded-top" alt="${product.name}" onerror="this.src='img/default.jpg'">
                </div>
                <div class="text-white bg-secondary px-3 py-1 rounded position-absolute" style="top: 10px; left: 10px;">
                    ${product.category}
                </div>
                <div class="p-4 border border-secondary border-top-0 rounded-bottom bg-light">
                    <h4 class="text-dark">${product.name}</h4>
                    <p class="text-muted">${product.description}</p>
                    <div class="d-flex justify-content-between flex-lg-wrap">
                        <p class="text-dark fs-5 fw-bold mb-0">$${product.price.toFixed(2)} / ${product.unit}</p>
                        <a href="#" class="btn border border-secondary rounded-pill px-3 text-primary" 
                           onclick="addToCart(${product.id}); return false;">
                            <i class="fa fa-shopping-bag me-2 text-primary"></i> Add to cart
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to display featured products only (for homepage)
async function displayFeaturedProducts(containerId = 'featured-products') {
    const products = await loadProducts();
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('Container not found');
        return;
    }
    
    const featuredProducts = products.filter(product => product.featured);
    container.innerHTML = '';
    
    featuredProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.innerHTML += productCard;
    });
}

// Function to display favorite products (bestsellers/owner's picks for homepage)
async function displayFavoriteProducts(containerId = 'favorite-products') {
    const products = await loadProducts();
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error('Container not found');
        return;
    }
    
    const favoriteProducts = products.filter(product => product.favorite);
    container.innerHTML = '';
    
    if (favoriteProducts.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center">No favorite products available</p></div>';
        return;
    }
    
    favoriteProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.innerHTML += productCard;
    });
}

// Function to filter products by category
async function filterByCategory(category) {
    const products = await loadProducts();
    const container = document.getElementById('products-container');
    
    if (!container) return;
    
    let filteredProducts = products;
    
    if (category && category !== 'all') {
        filteredProducts = products.filter(product => 
            product.category.toLowerCase() === category.toLowerCase()
        );
    }
    
    container.innerHTML = '';
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.innerHTML += productCard;
    });
}

// Function to search products
async function searchProducts(searchTerm) {
    const products = await loadProducts();
    const container = document.getElementById('products-container');
    
    if (!container) return;
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    container.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center">No products found</p></div>';
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        container.innerHTML += productCard;
    });
}

// Function to add product to cart (basic implementation with AJAX-like behavior)
async function addToCart(productId) {
    const products = await loadProducts();
    const product = products.find(p => p.id == productId); // Use == to handle string/number comparison
    
    if (!product) {
        console.error('Product not found');
        showToast('Product not found!', 'error');
        return;
    }
    
    // Get existing cart from localStorage or create new one
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showToast(`Added another ${product.name} to cart!`);
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
        showToast(`${product.name} added to cart!`);
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count in UI
    updateCartCount();
}

// Function to update cart count badge
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartBadge = document.querySelector('.fa-shopping-bag + span');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add toast notification styles
    addToastStyles();
    
    // Update cart count on page load
    updateCartCount();
    
    // Check which page we're on and load appropriate products
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'shop.html') {
        displayProducts('products-container');
    } else if (currentPage === 'index.html' || currentPage === '') {
        // Display favorite products (bestsellers/owner's picks) on homepage
        displayFavoriteProducts('favorite-products');
    }
    
    // Add search functionality if search input exists
    const searchInput = document.querySelector('input[type="search"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchProducts(e.target.value);
        });
    }
});