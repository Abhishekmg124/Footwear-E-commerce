const express = require("express");

const {
    getSalesReport
} = require("../controllers/reportController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/sales", protect, admin, getSalesReport);

module.exports = router;