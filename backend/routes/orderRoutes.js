const express = require("express");

const {
    createOrder,
    getMyOrders,
    getOrderById,
    downloadReceipt
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const {
    getAllOrders,
    updateOrderStatus
} = require("../controllers/adminOrderController");

const router = express.Router();

// Create order
router.post("/", protect, createOrder);
router.get("/", protect, getMyOrders);
router.get("/admin", protect, admin, getAllOrders);
router.patch("/admin/:id/status", protect, admin, updateOrderStatus);
router.get("/receipt/:id", protect, downloadReceipt);
router.get("/:id", protect, getOrderById);

module.exports = router;