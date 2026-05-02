# Atul Bakery — Website (Frontend)

Modern, animated single-page website for Atul Bakery, House of Freshness — Floral Park, NY.

## What's Included

- **Animated Hero** with floating logo, decorative rings, and floating product tags
- **Marquee banner** highlighting key features
- **About section** with image collage and 15-year badge
- **Full Menu** with category filtering (Pastries, Cakes, Snacks, Cake Shakes, Puffs)
  - All 75+ menu items from the official menu boards
  - **Add to Cart** system with quantity steppers — items pile up in cart, just like a real e-commerce site
- **Slide-in Cart Drawer** (right side) — accessible from the cart icon in navbar
  - View, edit quantities, remove items
  - Live subtotal calculation
  - Persistent across page reloads (saved in browser storage)
- **Two-step Checkout** — review your order summary on the left, fill customer info on the right
- **Success modal** with unique order ID after submission
- **Gallery** with hover effects
- **Contact section** with Google Map embed
- **Footer** with Instagram, Facebook, TikTok links

## Cart System Flow

1. User browses menu, clicks **+ Add** on any item → item is added to cart, button becomes a quantity stepper (− 1 +)
2. Cart icon in navbar pulses and shows item count badge
3. User can click cart icon anytime to **slide open the cart drawer** to review/edit
4. From cart drawer, click **"Proceed to Checkout"** → smoothly scrolls to order section
5. Order section shows **order summary on left** + **customer info form on right**
6. On submit → success modal with unique order ID (#AB-XXXXXX)
7. Cart is automatically cleared after successful order

## Tech Stack

- Bootstrap 5.3.3 (CDN)
- Vanilla JavaScript (no build step required)
- AOS scroll animations
- Font Awesome 6 icons
- Google Fonts (Playfair Display, DM Sans, Cormorant Garamond)

## How to Run

Just open `index.html` in any browser. No build process needed.

For the best experience, serve it via a simple local server:

```bash
# Python 3
python -m http.server 8000

# Or with Node.js
npx serve .
```

Then visit `http://localhost:8000`.

## File Structure

```
atul-bakery/
├── index.html           # Main HTML with all sections
├── css/
│   └── style.css        # All styling (modern minimal premium theme)
├── js/
│   ├── menu-data.js     # All menu items with prices
│   └── script.js        # Interactivity, filtering, form handling
├── images/
│   └── logo.jpg         # Atul Bakery logo
└── README.md            # This file
```

## Customization Quick Tips

**Colors** — edit CSS variables at the top of `css/style.css`:
- `--brand-red: #c1121f;` (main brand color)
- `--brand-cream: #fdf8f3;` (background)

**Menu items** — edit `js/menu-data.js`. Each item has: name, price, category, tag, icon, desc.

**Hours / Address / Phone** — search and replace in `index.html`.

**Social links** — search for `instagram.com/atul_bakery_hs` in `index.html`.

## Next Steps (Backend Phase)

The pickup order form is wired up on the frontend but doesn't send orders anywhere yet. Next phase will add:
- Email-on-submit (orders sent to bakery email)
- SMS / WhatsApp notification
- Optional admin dashboard to view orders

## Brand Info

- **Atul Bakery** — House of Freshness
- 258-02 Hillside Ave., Floral Park, NY 11004
- Phone: (347) 426-5683
- Hours: Sun–Thu 10 AM–10 PM, Fri–Sat 10 AM–11 PM
- Instagram: [@atul_bakery_hs](https://www.instagram.com/atul_bakery_hs/)
- Facebook: [bakeryatul](https://www.facebook.com/bakeryatul/)
- TikTok: [atul-bakery](https://www.tiktok.com/discover/atul-bakery)
