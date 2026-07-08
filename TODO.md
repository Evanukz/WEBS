# yamskis e-commerce build TODO

## Step 1 — Scaffold repo
- [ ] Create `yamskis/` (React + Tailwind) frontend folder with standard structure
- [ ] Create `server/` (Node + Express) backend folder with standard structure

## Step 2 — Backend (Express)
- [ ] Add server entry files (`src/index.js`, `src/app.js`)
- [ ] Add MongoDB connection + env config
- [ ] Add JWT auth middleware + admin middleware
- [ ] Create routers (as separate files) for:
  - [ ] `auth` (register/login)
  - [ ] `products` (list/get/search)
  - [ ] `reviews` (create)
  - [ ] `wishlist`
  - [ ] `cart` (optional if server-side; otherwise endpoints for syncing)
  - [ ] `orders` (create, list)
  - [ ] `admin` (products CRUD + orders manage)
- [ ] Create Mongoose models: `User`, `Product`, `Review`, `Order`
- [ ] Add dummy seed script and seed on startup
- [ ] Add payment service stubs (Paystack/Flutterwave ready)

## Step 3 — Frontend
- [ ] Add Tailwind + layout components
- [ ] Add React Router pages:
  - [ ] Home (Jumia-like orange UI)
  - [ ] Product list
  - [ ] Product details (reviews/ratings)
  - [ ] Cart
  - [ ] Wishlist
  - [ ] Checkout
  - [ ] Order confirmation
  - [ ] Login/Register
  - [ ] Profile (order history)
  - [ ] Admin dashboard (CRUD + order management)
- [ ] Add reusable components (navbar, hero carousel, product card, skeletons)
- [ ] Implement Context for auth/cart/wishlist

## Step 4 — Integrate
- [ ] Wire frontend API calls to backend routes
- [ ] Implement add/remove cart, wishlist toggle
- [ ] Implement checkout -> create order -> confirmation
- [ ] Implement review submission
- [ ] Implement admin product CRUD + order management

## Step 5 — Run & verify
- [ ] Provide run instructions in README
- [ ] Start server + client and verify core flows

