// Yupoo Configuration (keeping for reference)
window.VERSION = '4.26.33';
// ... (other config)

class ProductManager {
    constructor() {
        this.productsGrid = document.getElementById('productsGrid');
        this.burgerMenu = document.querySelector('.burger-menu');
        this.categoryOverlay = document.querySelector('.category-overlay');
        this.allProducts = [];
        this.categoryKeywords = {
            'Jackets': ['jacket', 'coat', 'bomber', 'blazer'],
            'Pants': ['pants', 'trousers', 'cargo', 'jeans', 'flare'],
            'Sweaters': ['sweater', 'sweatshirt', 'hoodie', 'pullover', 'crewneck', 'turtleneck'],
            'Shoes': ['shoes', 'boots', 'derby'],
            'Accessories': ['scarf', 'bag', 'belt', 'necklace', 'headgear', 'balaclava']
        };
        this.initializeOverlay();
    }

    initializeOverlay() {
        // Toggle overlay
        this.burgerMenu.addEventListener('click', () => {
            this.burgerMenu.classList.toggle('active');
            this.categoryOverlay.classList.toggle('show');
        });

        // Handle category selection
        const items = document.querySelectorAll('.category-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                items.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                this.filterByCategory(item.dataset.category);
                this.burgerMenu.classList.remove('active');
                this.categoryOverlay.classList.remove('show');
            });
        });

        // Close overlay when clicking outside
        this.categoryOverlay.addEventListener('click', (e) => {
            if (e.target === this.categoryOverlay) {
                this.burgerMenu.classList.remove('active');
                this.categoryOverlay.classList.remove('show');
            }
        });
    }

    getProductCategory(title) {
        title = title.toLowerCase();
        for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
            if (keywords.some(keyword => 
                title.includes(keyword) || 
                title.includes(keyword + 's') || 
                title.includes(keyword.replace('s', ''))
            )) {
                return category;
            }
        }
        return 'Other';
    }

    filterByCategory(category) {
        if (category === 'All') {
            this.displayAllProducts();
            return;
        }

        const filteredProducts = this.allProducts.filter(product => 
            this.getProductCategory(product.title) === category
        );

        this.displayFilteredProducts(filteredProducts);
    }

    displayFilteredProducts(products) {
        this.productsGrid.innerHTML = '';
        if (products.length === 0) {
            this.productsGrid.innerHTML = '<div class="no-products">No products in this category</div>';
            return;
        }
        products.forEach(product => {
            this.productsGrid.appendChild(this.createProductCard(product));
        });
    }

    displayAllProducts() {
        this.productsGrid.innerHTML = '';
        this.allProducts.forEach(product => {
            this.productsGrid.appendChild(this.createProductCard(product));
        });
    }

    async fetchProducts() {
        try {
            const apiUrl = 'https://joyabuy.com/search-info/get-tb-shop-full';
            const headers = {
                'accept': '*/*',
                'accept-language': 'en-GB,en;q=0.9',
                'referer': 'https://joyabuy.com/shops/',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin'
            };

            const pagePromises = Array.from({ length: 9 }, (_, i) => 
                fetch(`${apiUrl}?${new URLSearchParams({
                    ShopId: '68237358',
                    Page: (i + 1).toString(),
                    Language: 'en'
                })}`, { headers })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
            );

            const pagesData = await Promise.all(pagePromises);
            
            // Process products
            const seenIds = new Set();
            this.allProducts = pagesData
                .flatMap(pageData => pageData.data.shopProducts.productList)
                .filter(product => {
                    if (!seenIds.has(product.id)) {
                        seenIds.add(product.id);
                        return true;
                    }
                    return false;
                })
                .map(product => ({
                    title: product.name,
                    image: product.imgUrl,
                    price: `¥${product.price}`,
                    link: `https://item.taobao.com/item.htm?id=${product.id}`,
                    sold: product.sold
                }));

            // Display all products initially
            this.displayAllProducts();

        } catch (error) {
            console.error('Error fetching products:', error);
            this.productsGrid.innerHTML = `
                <div class="error">
                    <p>Unable to load products. Please try again later.</p>
                    <a href="https://shop68237358.world.taobao.com/" target="_blank" class="error-link">
                        Visit Taobao Store
                    </a>
                </div>
            `;
        }
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <a href="${product.link}" target="_blank">
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <div class="product-info">
                    <div class="product-details">
                        <h3>${product.title}</h3>
                    </div>
                    <div class="price-info">
                        <span class="price">${product.price}</span>
                        ${product.sold ? `<span class="sold">${product.sold} sold</span>` : ''}
                    </div>
                </div>
            </a>
        `;
        
        return card;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const productManager = new ProductManager();
    productManager.fetchProducts();
}); 