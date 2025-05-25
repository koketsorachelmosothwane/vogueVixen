// Cart array to store items
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Sanitize input to prevent XSS
function sanitizeInput(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Display error message below input field
function displayError(fieldId, message) {
  const errorElement = document.getElementById(`error-${fieldId}`);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

// Clear all error messages
function clearErrors() {
  ['full-name', 'email', 'card-number', 'card-expiry', 'card-cvc', 'billing-street', 'billing-city', 'billing-postal', 'billing-country'].forEach(id => {
    displayError(id, '');
  });
}

// Update cart count in navigation
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
  }
}

// Update cart and checkout display
function updateCartDisplay() {
  const checkoutItemsContainer = document.getElementById('checkout-items');
  const checkoutSubtotal = document.getElementById('checkout-subtotal');
  const checkoutTax = document.getElementById('checkout-tax');
  const checkoutTotal = document.getElementById('checkout-total');
  const proceedButton = document.getElementById('proceed-to-checkout');

  if (checkoutItemsContainer) {
    checkoutItemsContainer.innerHTML = '';
  }

  let subtotal = 0;

  if (cart.length === 0) {
    if (checkoutItemsContainer) {
      checkoutItemsContainer.innerHTML = '<p class="placeholder-message">Your cart is empty.</p>';
    }
    if (proceedButton) {
      proceedButton.disabled = true;
      proceedButton.style.opacity = '0.5';
      proceedButton.style.cursor = 'not-allowed';
    }
  } else {
    cart.forEach((item, index) => {
      if (checkoutItemsContainer) {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        itemElement.innerHTML = `
          <img src="images/product${item.id || index + 1}.jpg" alt="${sanitizeInput(item.name)}">
          <div class="cart-item-details">
            <p>${sanitizeInput(item.name)} (x${item.quantity})</p>
            <p>P ${(item.price * item.quantity).toFixed(2)}</p>
          </div>
          <button class="remove-item" data-index="${index}">Remove</button>
        `;
        checkoutItemsContainer.appendChild(itemElement);
      }
      subtotal += item.price * item.quantity;
    });
    if (proceedButton) {
      proceedButton.disabled = false;
      proceedButton.style.opacity = '1';
      proceedButton.style.cursor = 'pointer';
    }
  }

  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  if (checkoutSubtotal) checkoutSubtotal.textContent = subtotal.toFixed(2);
  if (checkoutTax) checkoutTax.textContent = tax.toFixed(2);
  if (checkoutTotal) checkoutTotal.textContent = total.toFixed(2);

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// Add item to cart
function addToCart(name, price, id) {
  if (!name || !price || isNaN(parseFloat(price))) {
    console.error('Invalid product data:', { name, price, id });
    alert('Unable to add item to cart. Please try again.');
    return;
  }
  const existingItem = cart.find(item => item.name === name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ name, price: parseFloat(price), quantity: 1, id: id || `product-${Date.now()}` });
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
  alert(`${sanitizeInput(name)} added to cart!`);
}

// Remove item from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartDisplay();
}

// Proceed to checkout
function proceedToCheckout() {
  const checkoutForm = document.getElementById('checkout-form');
  const confirmationStep = document.getElementById('confirmation-step');
  const checkoutContainer = document.querySelector('.checkout-container');

  if (!checkoutForm || !confirmationStep || !checkoutContainer) {
    console.error('Checkout elements not found:', { checkoutForm, confirmationStep, checkoutContainer });
    alert('Unable to proceed to checkout. Please try again.');
    return;
  }

  // Validate form before proceeding
  const fullName = document.getElementById('full-name')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const cardNumber = document.getElementById('card-number')?.value.replace(/\s/g, '');
  const cardExpiry = document.getElementById('card-expiry')?.value.trim();
  const cardCvc = document.getElementById('card-cvc')?.value.trim();

  let hasError = false;

  if (!fullName) {
    displayError('full-name', 'Full name is required.');
    hasError = true;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    displayError('email', 'Invalid email format.');
    hasError = true;
  }
  if (!cardNumber || !/^\d{16}$/.test(cardNumber)) {
    displayError('card-number', 'Card number must be 16 digits.');
    hasError = true;
  }
  if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
    displayError('card-expiry', 'Expiry must be MM/YY.');
    hasError = true;
  }
  if (!cardCvc || !/^\d{3,4}$/.test(cardCvc)) {
    displayError('card-cvc', 'CVC must be 3 or 4 digits.');
    hasError = true;
  }

  if (hasError) {
    alert('Please fill in all required fields correctly.');
    return;
  }

  // Hide checkout container and show confirmation
  checkoutContainer.style.display = 'none';
  confirmationStep.style.display = 'block';

  // Populate order details
  const orderDetails = document.getElementById('order-details');
  if (orderDetails) {
    orderDetails.innerHTML = `
      <p><strong>Name:</strong> ${sanitizeInput(fullName)}</p>
      <p><strong>Email:</strong> ${sanitizeInput(email)}</p>
      <p><strong>Items:</strong></p>
      <ul>${cart.map(item => `<li>${sanitizeInput(item.name)} (x${item.quantity}) - P ${(item.price * item.quantity).toFixed(2)}</li>`).join('')}</ul>
      <p><strong>Subtotal:</strong> P ${document.getElementById('checkout-subtotal').textContent}</p>
      <p><strong>Tax (15%):</strong> P ${document.getElementById('checkout-tax').textContent}</p>
      <p><strong>Total:</strong> P ${document.getElementById('checkout-total').textContent}</p>
    `;
  }

  // Clear cart after confirmation
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

// Handle checkout form submission
function handleCheckoutSubmit(event) {
  event.preventDefault();
  proceedToCheckout();
}

// Toggle dropdown on mobile
function toggleDropdown(event) {
  const dropdown = event.target.closest('.dropdown');
  if (window.innerWidth <= 768 && dropdown) {
    dropdown.classList.toggle('active');
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  updateCartDisplay();

  // Delegate event listeners to document for dynamic buttons
  document.addEventListener('click', (event) => {
    // Add to cart
    if (event.target.classList.contains('add-to-cart')) {
      const button = event.target;
      const name = button.dataset.name;
      const price = button.dataset.price;
      const id = button.dataset.id || button.closest('.product-card')?.querySelector('img')?.src.match(/product(\d+)\.jpg/)?.[1] || `product-${Date.now()}`;
      addToCart(name, price, id);
    }

    // Buy now
    if (event.target.classList.contains('buy-now')) {
      const button = event.target;
      const name = button.dataset.name;
      const price = button.dataset.price;
      const id = button.dataset.id || button.closest('.product-card')?.querySelector('img')?.src.match(/product(\d+)\.jpg/)?.[1] || `product-${Date.now()}`;
      addToCart(name, price, id);
      window.location.href = 'wishlist.html';
    }

    // Remove item
    if (event.target.classList.contains('remove-item')) {
      const index = event.target.dataset.index;
      removeFromCart(index);
    }

    // Proceed to checkout
    if (event.target.matches('#proceed-to-checkout, .proceed-to-checkout')) {
      proceedToCheckout();
    }
  });

  // Checkout form submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }

  // Newsletter form submission
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.getElementById('newsletter-email')?.value.trim();
      if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert(`Subscribed with ${sanitizeInput(email)}!`);
        newsletterForm.reset();
      } else {
        alert('Please enter a valid email.');
      }
    });
  }

  // Contact form submission
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = document.getElementById('name')?.value.trim();
      const email = document.getElementById('email')?.value.trim();
      const message = document.getElementById('message')?.value.trim();
      if (name && email && message && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Message sent! We will get back to you soon.');
        contactForm.reset();
      } else {
        alert('Please fill in all fields with valid data.');
      }
    });
  }

  // Same as billing checkbox
  const sameAsBilling = document.getElementById('same-as-billing');
  if (sameAsBilling) {
    sameAsBilling.addEventListener('change', () => {
      const shippingFields = ['shipping-street', 'shipping-city', 'shipping-postal', 'shipping-country'];
      shippingFields.forEach(field => {
        const input = document.getElementById(field);
        if (input) {
          input.disabled = sameAsBilling.checked;
          if (sameAsBilling.checked) {
            input.value = document.getElementById(field.replace('shipping', 'billing'))?.value || '';
          } else {
            input.value = '';
          }
        }
      });
    });
  }

  // Dropdown toggle for mobile
  document.querySelectorAll('.dropdown').forEach(dropdown => {
    dropdown.addEventListener('click', toggleDropdown);
  });
});