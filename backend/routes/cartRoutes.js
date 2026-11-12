const express = require("express");

const {
    addToCart,
    getCart,
    removeFromCart
} = require("../controllers/cartController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add product to cart
router.post("/", protect, addToCart);

// Get customer cart
router.get("/", protect, getCart);

router.delete(
    "/:productId/:size",
    protect,
    removeFromCart
);

module.exports = router;