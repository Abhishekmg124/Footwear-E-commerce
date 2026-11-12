# Footwear E-commerce

A footwear storefront with a React frontend and an Express/MongoDB API. Admin users can manage products, inventory, orders, and sales from `/admin`.

## Requirements

- Node.js and npm
- MongoDB connection string

## Backend

1. Install dependencies: `cd backend` then `npm install`.
2. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI` and a private, random `JWT_SECRET`.
3. Start the API with `npm start` (available at `http://localhost:5000`).

To create an administrator, set `ADMIN_NAME`, `ADMIN_EMAIL`, and a unique `ADMIN_PASSWORD` (at least 8 characters) in `backend/.env`, then run `node createAdmin.js` from the `backend` directory. The script hashes the password before saving it. Do not commit `backend/.env`.

## Frontend

In another terminal, run `cd frontend`, `npm install`, and `npm start`. The storefront is available at `http://localhost:3000` and uses the API at `http://localhost:5000/api`.
