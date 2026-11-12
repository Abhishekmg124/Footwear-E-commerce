const express = require("express");

const {
    createProduct,
    getProducts,
    getAdminProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    updateProductStock
} = require("../controllers/productController");


const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getProducts);
router.get("/admin", protect, admin, getAdminProducts);
router.get("/:id", getProductById);

router.delete("/:id", 
    protect,
    admin, 
    deleteProduct
);
router.post(
    "/",
    protect,
    admin,
    createProduct
);

router.put(
    "/:id",
    protect,
    admin,
    updateProduct
);

router.patch(
    "/:id/status",
    protect,
    admin,
    updateProductStatus
);

router.patch(
    "/:id/stock",
    protect,
    admin,
    updateProductStock
);

module.exports = router;