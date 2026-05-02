// =========================================
// ATUL BAKERY — Main JS with Cart System
// =========================================

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------
  // CART STATE
  // ------------------------------------------
  let cart = [];
  const CART_KEY = 'atul_cart_v1';

  function loadCart() {
    try {
      const data = localStorage.getItem(CART_KEY);
      if (data) cart = JSON.parse(data);
    } catch (e) { cart = []; }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }
  loadCart();

  // ------------------------------------------
  // AOS init
  // ------------------------------------------
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 900, easing: 'ease-out-cubic', once: true, offset: 80 });
  }

  // ------------------------------------------
  // NAVBAR
  // ------------------------------------------
  const nav = document.querySelector('.custom-navbar');
  const onScroll = () => {
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  const setActive = () => {
    const y = window.scrollY + 120;
    sections.forEach(sec => {
      if (y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight) {
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + sec.id);
        });
      }
    });
  };
  window.addEventListener('scroll', setActive);

  document.querySelectorAll('.navbar-nav .nav-link').forEach(l => {
    l.addEventListener('click', () => {
      const collapse = document.getElementById('navMenu');
      if (collapse.classList.contains('show')) {
        new bootstrap.Collapse(collapse).hide();
      }
    });
  });

  // ------------------------------------------
  // HELPERS
  // ------------------------------------------
  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  function formatPrice(n) { return '$' + n.toFixed(2); }

  // ------------------------------------------
  // MENU RENDER
  // ------------------------------------------
  const grid = document.getElementById('menu-grid');
  let currentFilter = 'all';

  function renderMenu(filter = currentFilter) {
    currentFilter = filter;
    const items = filter === 'all' ? menuData : menuData.filter(i => i.category === filter);

    grid.innerHTML = items.map((item, idx) => {
      const id = slugify(item.name);
      const inCart = cart.find(c => c.id === id);
      const qty = inCart ? inCart.qty : 0;

      return `
        <div class="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay="${(idx % 3) * 80}">
          <div class="menu-card ${qty > 0 ? 'in-cart' : ''}" data-id="${id}">
            <div class="menu-card-head">
              <span class="menu-card-tag">${item.tag}</span>
              <div class="menu-card-icon"><i class="fas ${item.icon}"></i></div>
            </div>
            <h4>
              ${item.veg ? '<span class="veg-dot" title="Vegetarian"></span>' : ''}
              ${item.name}
            </h4>
            <p class="menu-card-meta">${item.desc}</p>
            <div class="menu-card-foot">
              <div class="menu-card-price">
                $${item.price}
                ${item.unit ? `<small>${item.unit}</small>` : ''}
              </div>
              <div class="menu-card-action">
                ${qty === 0
                  ? `<button type="button" class="btn-add-card" data-action="add"><i class="fas fa-plus"></i> Add</button>`
                  : `<div class="qty-stepper">
                       <button type="button" class="qty-btn" data-action="decrease" aria-label="Decrease">−</button>
                       <span class="qty-num">${qty}</span>
                       <button type="button" class="qty-btn" data-action="increase" aria-label="Increase">+</button>
                     </div>`
                }
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (typeof AOS !== 'undefined') AOS.refreshHard();

    grid.querySelectorAll('.menu-card').forEach(card => {
      const id = card.getAttribute('data-id');
      const item = menuData.find(m => slugify(m.name) === id);
      if (!item) return;

      card.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.getAttribute('data-action');
          if (action === 'add' || action === 'increase') {
            addToCart(item);
            pulseCart();
          } else if (action === 'decrease') {
            decreaseFromCart(item);
          }
          renderMenu();
        });
      });
    });
  }

  // ------------------------------------------
  // FILTERS
  // ------------------------------------------
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMenu(btn.getAttribute('data-filter'));
    });
  });

  // ------------------------------------------
  // CART OPS
  // ------------------------------------------
  function addToCart(item) {
    const id = slugify(item.name);
    const existing = cart.find(c => c.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id, name: item.name, price: parseFloat(item.price),
        unit: item.unit || '', category: item.category, qty: 1
      });
    }
    saveCart();
    updateCartUI();
    showToast(`Added "${item.name}"`, 'success');
  }

  function decreaseFromCart(item) {
    const id = slugify(item.name);
    const idx = cart.findIndex(c => c.id === id);
    if (idx === -1) return;
    cart[idx].qty -= 1;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    saveCart();
    updateCartUI();
  }

  function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    saveCart();
    updateCartUI();
    renderMenu();
  }

  function updateQty(id, qty) {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty = Math.max(1, qty);
    saveCart();
    updateCartUI();
    renderMenu();
  }

  function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
    renderMenu();
  }

  function cartSubtotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }
  function totalCount() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  // ------------------------------------------
  // CART UI
  // ------------------------------------------
  const cartCountEl = document.getElementById('cartCount');
  const cartItemCountEl = document.getElementById('cartItemCount');
  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartFooterEl = document.getElementById('cartFooter');
  const cartTotalEl = document.getElementById('cartTotal');
  const floatingCartEl = document.getElementById('floatingCart');
  const floatingCountEl = document.getElementById('floatingCount');
  const floatingTotalEl = document.getElementById('floatingTotal');
  const stickyCheckoutEl = document.getElementById('stickyCheckout');
  const stickyCountEl = document.getElementById('stickyCount');
  const stickyTotalEl = document.getElementById('stickyTotal');

  function updateCartUI() {
    const count = totalCount();
    cartCountEl.textContent = count;
    cartCountEl.classList.toggle('has-items', count > 0);
    if (cartItemCountEl) cartItemCountEl.textContent = count;

    if (cart.length === 0) {
      cartEmptyEl.style.display = 'flex';
      cartItemsEl.style.display = 'none';
      cartFooterEl.style.display = 'none';
    } else {
      cartEmptyEl.style.display = 'none';
      cartItemsEl.style.display = 'block';
      cartFooterEl.style.display = 'block';
      renderCartItems();
    }
    cartTotalEl.textContent = formatPrice(cartSubtotal());

    // Floating cart button
    if (floatingCartEl) {
      if (count > 0) {
        floatingCartEl.classList.add('visible');
        floatingCountEl.textContent = count;
        floatingTotalEl.textContent = formatPrice(cartSubtotal());
        // bump animation when items change
        floatingCartEl.classList.remove('bump');
        void floatingCartEl.offsetWidth;
        floatingCartEl.classList.add('bump');
      } else {
        floatingCartEl.classList.remove('visible');
      }
    }

    // Sticky checkout button (mobile only, content updates always)
    if (stickyCheckoutEl) {
      stickyCountEl.textContent = count;
      stickyTotalEl.textContent = formatPrice(cartSubtotal());
      // bump animation
      if (count > 0) {
        stickyCheckoutEl.classList.remove('bump');
        void stickyCheckoutEl.offsetWidth;
        stickyCheckoutEl.classList.add('bump');
      }
      // visibility is controlled by scroll observer (see below)
      updateStickyCheckoutVisibility();
    }

    updateCheckoutUI();
  }

  function renderCartItems() {
    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-info">
          <h6>${item.name}</h6>
          <p class="cart-item-price">${formatPrice(item.price)} ${item.unit || ''} each</p>
        </div>
        <div class="cart-item-controls">
          <div class="qty-stepper qty-stepper-sm">
            <button type="button" class="qty-btn" data-action="decrease">−</button>
            <span class="qty-num">${item.qty}</span>
            <button type="button" class="qty-btn" data-action="increase">+</button>
          </div>
          <div class="cart-item-subtotal">${formatPrice(item.price * item.qty)}</div>
          <button type="button" class="cart-item-remove" data-action="remove" aria-label="Remove">
            <i class="fas fa-trash-can"></i>
          </button>
        </div>
      </div>
    `).join('');

    cartItemsEl.querySelectorAll('.cart-item').forEach(row => {
      const id = row.getAttribute('data-id');
      row.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.getAttribute('data-action');
          const item = cart.find(c => c.id === id);
          if (!item) return;
          if (action === 'increase') updateQty(id, item.qty + 1);
          else if (action === 'decrease') updateQty(id, item.qty - 1);
          else if (action === 'remove') removeFromCart(id);
        });
      });
    });
  }

  // ------------------------------------------
  // CHECKOUT VIEW
  // ------------------------------------------
  const checkoutEmptyEl = document.getElementById('checkoutEmpty');
  const checkoutViewEl = document.getElementById('checkoutView');
  const checkoutItemsEl = document.getElementById('checkoutItems');
  const checkoutSubtotalEl = document.getElementById('checkoutSubtotal');
  const checkoutTotalEl = document.getElementById('checkoutTotal');

  function updateCheckoutUI() {
    if (cart.length === 0) {
      checkoutEmptyEl.style.display = 'block';
      checkoutViewEl.style.display = 'none';
      return;
    }
    checkoutEmptyEl.style.display = 'none';
    checkoutViewEl.style.display = 'block';

    checkoutItemsEl.innerHTML = cart.map(item => `
      <div class="checkout-item">
        <div class="checkout-item-qty">${item.qty}×</div>
        <div class="checkout-item-info">
          <h6>${item.name}</h6>
          <small>${formatPrice(item.price)} ${item.unit || ''} each</small>
        </div>
        <div class="checkout-item-price">${formatPrice(item.price * item.qty)}</div>
      </div>
    `).join('');

    const subtotal = cartSubtotal();
    checkoutSubtotalEl.textContent = formatPrice(subtotal);
    checkoutTotalEl.textContent = formatPrice(subtotal);
  }

  // ------------------------------------------
  // CART DRAWER
  // ------------------------------------------
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartToggle = document.getElementById('cartToggle');
  const cartClose = document.getElementById('cartClose');
  const browseMenuBtn = document.getElementById('browseMenuBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const editCartBtn = document.getElementById('editCartBtn');

  function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('show');
    document.body.classList.add('cart-open');
  }
  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('show');
    document.body.classList.remove('cart-open');
  }

  cartToggle.addEventListener('click', openCart);
  cartClose.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  // Floating cart button → open drawer
  if (floatingCartEl) {
    floatingCartEl.addEventListener('click', openCart);
  }

  browseMenuBtn.addEventListener('click', () => {
    closeCart();
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
  });

  checkoutBtn.addEventListener('click', () => {
    closeCart();
    setTimeout(() => {
      document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
    }, 250);
  });

  if (editCartBtn) editCartBtn.addEventListener('click', openCart);

  clearCartBtn.addEventListener('click', () => {
    if (confirm('Clear all items from your cart?')) {
      clearCart();
      showToast('Cart cleared', 'info');
    }
  });

  function pulseCart() {
    cartToggle.classList.remove('pulse');
    void cartToggle.offsetWidth;
    cartToggle.classList.add('pulse');
  }

  // ------------------------------------------
  // STICKY CHECKOUT BUTTON (mobile)
  //   Shows only on mobile, when:
  //   - Cart has items, AND
  //   - User is on/near the order section (checkout view)
  //   Tapping it scrolls to customer info form.
  // ------------------------------------------
  const orderSection = document.getElementById('order');
  let inOrderSection = false;

  function updateStickyCheckoutVisibility() {
    if (!stickyCheckoutEl) return;
    const isMobile = window.innerWidth < 992;
    const hasItems = cart.length > 0;

    if (isMobile && hasItems && inOrderSection) {
      stickyCheckoutEl.classList.add('visible');
    } else {
      stickyCheckoutEl.classList.remove('visible');
    }
  }

  // Track when the order section is in viewport
  if (orderSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        // Show sticky button when order section is at least partially visible
        inOrderSection = entry.isIntersecting;
        updateStickyCheckoutVisibility();
      });
    }, {
      // Trigger as soon as the section starts entering from below
      rootMargin: '0px 0px -20% 0px',
      threshold: 0
    });
    observer.observe(orderSection);
  }

  // Re-check on resize (mobile/desktop switching)
  window.addEventListener('resize', updateStickyCheckoutVisibility);

  // Click → smooth scroll to customer info form
  if (stickyCheckoutEl) {
    stickyCheckoutEl.addEventListener('click', () => {
      const target = document.getElementById('customerInfo');
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
        // Briefly highlight the form so user knows where to focus
        const form = document.getElementById('pickupForm');
        if (form) {
          form.classList.add('form-highlight');
          setTimeout(() => form.classList.remove('form-highlight'), 1500);
        }
        // Auto-focus the first empty field for convenience
        setTimeout(() => {
          const firstEmpty = form.querySelector('input:not([value]), input[value=""]');
          if (firstEmpty) firstEmpty.focus({ preventScroll: true });
        }, 500);
      }
    });
  }

  // ------------------------------------------
  // PICKUP FORM
  // ------------------------------------------
  const form = document.getElementById('pickupForm');
  if (form) {
    const dateInput = form.querySelector('input[name="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    form.addEventListener('submit', e => {
      e.preventDefault();

      if (cart.length === 0) {
        showToast('Your cart is empty. Add items first!', 'error');
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
        return;
      }

      const data = Object.fromEntries(new FormData(form));
      const orderId = 'AB-' + Date.now().toString().slice(-6);

      const orderSummary = {
        orderId,
        customer: { name: data.name, phone: data.phone, email: data.email || '' },
        pickup: { date: data.date, time: data.time },
        notes: data.notes || '',
        items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price, unit: c.unit })),
        subtotal: cartSubtotal(),
        total: cartSubtotal(),
        timestamp: new Date().toISOString()
      };

      console.log('==== ATUL BAKERY ORDER ====');
      console.log(orderSummary);
      console.log('===========================');

      document.getElementById('successName').textContent = data.name;
      document.getElementById('successPhone').textContent = data.phone;
      document.getElementById('successOrderId').textContent = '#' + orderId;
      document.getElementById('successModal').classList.add('show');

      form.reset();
      clearCart();
    });
  }

  const successClose = document.getElementById('successClose');
  if (successClose) {
    successClose.addEventListener('click', () => {
      document.getElementById('successModal').classList.remove('show');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ------------------------------------------
  // TOAST
  // ------------------------------------------
  function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast-msg');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className = `toast-msg toast-${type}`;
    const icon = type === 'success' ? 'fa-check-circle'
               : type === 'error' ? 'fa-circle-exclamation'
               : 'fa-circle-info';
    t.innerHTML = `<i class="fas ${icon}"></i><span>${message}</span>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 500);
    }, 2500);
  }

  // ------------------------------------------
  // SMOOTH SCROLL
  // ------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const y = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // ------------------------------------------
  // INITIAL RENDER
  // ------------------------------------------
  renderMenu();
  updateCartUI();

});
