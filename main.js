document.addEventListener('DOMContentLoaded', function () {
    // Cart functionality
    const cartButton = document.querySelector('.cart-button');
    const cartOverlay = document.getElementById('cartOverlay');
    const closeCartButton = document.getElementById('closeCart');
    const cartTableBody = document.querySelector('#cartTable tbody');
    const cartBadge = document.querySelector('.cart-badge');
    const clearCartButton = document.getElementById('clearCartButton');
    const buyNowButton = document.getElementById('buyNowButton');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    let totalPrice = 0;

    function updateCartDisplay() {
        if (!cartTableBody) return; // Only runs if on the order page
        
        cartTableBody.innerHTML = '';
        totalPrice = 0;
        
        // Update cart badge to show number of unique items
        const cartBadge = document.querySelector('.cart-badge');
        if (cartBadge) {
            cartBadge.textContent = cartItems.length.toString();
        }
        
        let totalQuantity = 0;
        
        cartItems.forEach(item => {
            const row = document.createElement('tr');
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            totalQuantity += parseInt(item.quantity);
            
            row.innerHTML = `
                <td>${item.name}</td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${itemTotal.toFixed(2)}</td>
            `;
            cartTableBody.appendChild(row);
        });
        
        const totalPriceElement = document.getElementById('totalPrice');
        if (totalPriceElement) {
            totalPriceElement.textContent = totalPrice.toFixed(2);
        }
    }

    function addToCart(medicineName, medicinePrice, quantity) {
        let itemIndex = cartItems.findIndex(item => item.name === medicineName);
        if (itemIndex > -1) {
            cartItems[itemIndex].quantity = parseInt(cartItems[itemIndex].quantity) + parseInt(quantity);
        } else {
            cartItems.push({ 
                name: medicineName, 
                price: parseFloat(medicinePrice), 
                quantity: parseInt(quantity) 
            });
        }
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        updateCartDisplay();
    }

    // Add to cart button listeners
    if (addToCartButtons) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function () {
                const medicineCard = this.closest('.medicine-card');
                const quantityInput = medicineCard.querySelector('.quantity-input');
                const quantity = parseInt(quantityInput.value);
                if (quantity > 0) {
                    const medicineName = this.dataset.name;
                    const medicinePrice = this.dataset.price;
                    addToCart(medicineName, medicinePrice, quantity);
                    quantityInput.value = 0;
                }
            });
        });
    }

    // Cart button listeners
    if (clearCartButton) {
        clearCartButton.addEventListener('click', function () {
            cartItems = [];
            localStorage.removeItem('cartItems');
            updateCartDisplay();
        });
    }

    if (buyNowButton) {
        buyNowButton.addEventListener('click', function () {
            window.location.href = 'details.html';
        });
    }

    if (cartButton) {
        cartButton.addEventListener('click', function () {
            cartOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeCartButton) {
        closeCartButton.addEventListener('click', function () {
            cartOverlay.style.display = 'none';
            document.body.style.overflow = '';
        });
    }

    // Initialize cart display if we're on the order page
    if (cartTableBody) {
        updateCartDisplay();
    }

    // Order Summary functionality for details page
    function displayOrderSummary() {
        const orderTableBody = document.querySelector('#orderTable tbody');
        const orderTotalPrice = document.querySelector('#orderTable #totalPrice');
        
        if (!orderTableBody || !orderTotalPrice) return;
        
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        let total = 0;
        
        orderTableBody.innerHTML = '';
        cartItems.forEach(item => {
            const row = document.createElement('tr');
            const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
            total += itemTotal;
            
            row.innerHTML = `
                <td>${item.name}</td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td>${item.quantity}</td>
                <td>$${itemTotal.toFixed(2)}</td>
            `;
            orderTableBody.appendChild(row);
        });
        
        orderTotalPrice.textContent = total.toFixed(2);
    }

    // Check if we're on the details page and initialize order summary
    if (document.querySelector('#orderTable')) {
        displayOrderSummary();
        
        // Payment form validation
        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Get form values
                const cardNumber = document.getElementById('cardNumber').value;
                const expiryDate = document.getElementById('expirationDate').value;
                const cvv = document.getElementById('cvv').value;
                const email = document.getElementById('email').value;
                const phone = document.getElementById('phone').value;

                // Validate all fields
                if (!validateCardNumber(cardNumber)) {
                    alert('Please enter a valid 16-digit card number');
                    return;
                }
                
                if (!validateExpiryDate(expiryDate)) {
                    alert('Please enter a valid expiration date (MM/YY)');
                    return;
                }
                
                if (!validateCVV(cvv)) {
                    alert('Please enter a valid CVV/CVC code');
                    return;
                }

                if (!validateEmail(email)) {
                    alert('Please enter a valid email address');
                    return;
                }

                if (!validatePhone(phone)) {
                    alert('Please enter a valid 10-digit phone number');
                    return;
                }

                // If all validations pass
                const deliveryDate = new Date();
                deliveryDate.setDate(deliveryDate.getDate() + 3);
                alert(`Thank you for your purchase! Your order will be delivered by ${deliveryDate.toLocaleDateString()}`);
                
                // Clear cart and redirect
                localStorage.removeItem('cartItems');
                window.location.href = 'index.html';
            });
        }

        // Format card number input
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 16) value = value.slice(0, 16);
                e.target.value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            });
        }

        // Format expiry date input
        const expiryInput = document.getElementById('expirationDate');
        if (expiryInput) {
            expiryInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 4) value = value.slice(0, 4);
                if (value.length > 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2);
                }
                e.target.value = value;
            });
        }
    }

    // Helper functions for validation
    function validateCardNumber(number) {
        return /^\d{16}$/.test(number.replace(/\s/g, ''));
    }

    function validateExpiryDate(date) {
        const [month, year] = date.split('/');
        if (!month || !year) return false;
        
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        const expMonth = parseInt(month);
        const expYear = parseInt(year);
        
        if (expMonth < 1 || expMonth > 12) return false;
        if (expYear < currentYear) return false;
        if (expYear === currentYear && expMonth < currentMonth) return false;
        
        return true;
    }

    function validateCVV(cvv) {
        return /^\d{3,4}$/.test(cvv);
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePhone(phone) {
        return /^\d{10}$/.test(phone.replace(/\D/g, ''));
    }

    // Favorites functionality
    const favoriteButtons = document.querySelectorAll('.add-to-favorite-button');
    const applyFavoriteButtons = document.querySelectorAll('.apply-favorite-button');
    const favoritesTableBody = document.querySelector('#favoritesTable tbody');

    function updateFavoriteTable() {
        const favoritesTableBody = document.querySelector('#favoritesTable tbody');
        if (!favoritesTableBody) return;
        
        favoritesTableBody.innerHTML = '';
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        if (favorites.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="3">No favorites found. Please add favorites first.</td>';
            favoritesTableBody.appendChild(row);
            return;
        }
        
        favorites.forEach(favorite => {
            const row = document.createElement('tr');
            const totalPrice = favorite.quantity > 1 ? 
                (favorite.price * favorite.quantity).toFixed(2) : 
                favorite.price;
            
            row.innerHTML = `
                <td>${favorite.name}</td>
                <td>${favorite.quantity}</td>
                <td>$${totalPrice}</td>
            `;
            favoritesTableBody.appendChild(row);
        });
    }

    favoriteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const medicineCard = this.closest('.medicine-card');
            const quantityInput = medicineCard.querySelector('.quantity-input');
            const quantity = parseInt(quantityInput.value);
            
            if (!quantity || quantity <= 0) {
                alert('Please select a quantity greater than 0');
                return;
            }

            const medicineName = this.dataset.name;
            const medicinePrice = parseFloat(this.dataset.price);
            
            // Get existing favorites
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            
            // Check if item already exists
            if (!favorites.some(item => item.name === medicineName)) {
                // Calculate total price if quantity > 1
                const totalPrice = quantity > 1 ? medicinePrice * quantity : medicinePrice;
                
                // Add new favorite
                favorites.push({
                    name: medicineName,
                    price: medicinePrice,
                    quantity: quantity,
                    totalPrice: totalPrice
                });
                
                // Save back to localStorage
                localStorage.setItem('favorites', JSON.stringify(favorites));
                alert('Item added to favorites!');
            } else {
                alert('This item is already in your favorites!');
            }
        });
    });

    applyFavoriteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
            const medicineCard = this.closest('.medicine-card');
            const favoriteButton = medicineCard.querySelector('.add-to-favorite-button');
            const name = favoriteButton.dataset.name;
            
            // First check if this specific item is in favorites
            const existingFavorite = favorites.find(item => item.name === name);
            
            if (!existingFavorite) {
                alert(`"${name}" is not in your favorites list. Please add it to favorites first before applying.`);
                return;
            }
            
            // Update the favorites table with current localStorage data
            updateFavoriteTable();
            
            const price = parseFloat(favoriteButton.dataset.price);
            // Add to cart with the favorite's quantity
            addToCart(name, price, existingFavorite.quantity);
            alert('Favorite item added to cart!');
        });
    });

    // Clear favorites functionality
    document.getElementById('clearFavoritesButton').addEventListener('click', function() {
        localStorage.removeItem('favorites');
        favoritesTableBody.innerHTML = '<tr><td colspan="3">No favorites found. Please add favorites first.</td></tr>';
        alert('Favorites cleared!');
    });

    // Initialize favorites table
    // updateFavoriteTable();
});