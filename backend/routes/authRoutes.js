const express = require("express");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, (req, res) => {
    res.status(200).json({
        message: "Profile accessed successfully",
        user: req.user
    });
});

router.get("/admin-test", protect, admin, (req, res) => {
    res.status(200).json({
        message: "Admin access granted",
        user: req.user
    });
});

module.exports = router;