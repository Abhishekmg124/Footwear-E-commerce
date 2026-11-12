const Product = require("../models/Product");

const createProduct = async (req, res) => {
    try {
        const {
            brand,
            category,
            model,
            price,
            sizes,
            images
        } = req.body;

        if (
            !brand ||
            !category ||
            !model ||
            price === undefined ||
            !sizes
        ) {
            return res.status(400).json({
                message: "All required fields must be provided"
            });
        }

        const product = await Product.create({
            brand,
            category,
            model,
            price,
            sizes,
            images
        });

        res.status(201).json({
            message: "Product created successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const getProducts = async (req, res) => {
    try {
        const {
            search,
            brand,
            category,
            minPrice,
            maxPrice,
            size
        } = req.query;

        // Only active products are shown
        const filter = {
            isActive: true
        };

        // Search by model, brand, or category
        if (search) {
            filter.$or = [
                {
                    model: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    brand: {
                        $regex: search,
                        $options: "i"
                    }
                },
                {
                    category: {
                        $regex: search,
                        $options: "i"
                    }
                }
            ];
        }

        // Filter by brand
        if (brand) {
            filter.brand = {
                $regex: brand,
                $options: "i"
            };
        }

        // Filter by category
        if (category) {
            filter.category = {
                $regex: category,
                $options: "i"
            };
        }

        // Filter by minimum price
        if (minPrice !== undefined) {
            filter.price = {
                ...filter.price,
                $gte: Number(minPrice)
            };
        }

        // Filter by maximum price
        if (maxPrice !== undefined) {
            filter.price = {
                ...filter.price,
                $lte: Number(maxPrice)
            };
        }

        // Filter by available size
        if (size !== undefined) {
            filter.sizes = {
                $elemMatch: {
                    size: Number(size),
                    stock: {
                        $gt: 0
                    }
                }
            };
        }

        const products = await Product.find(filter);

        res.status(200).json({
            message: "Products fetched successfully",
            count: products.length,
            products
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getAdminProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ updatedAt: -1 });

        res.status(200).json({
            message: "All products fetched successfully",
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            message: "Product fetched successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const {
            brand,
            category,
            model,
            price,
            sizes,
            images
        } = req.body;

        product.brand = brand ?? product.brand;
        product.category = category ?? product.category;
        product.model = model ?? product.model;
        product.price = price ?? product.price;
        product.sizes = sizes ?? product.sizes;
        product.images = images ?? product.images;

        const updatedProduct = await product.save();

        res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Product deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const updateProductStatus = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        product.isActive = !product.isActive;

        await product.save();

        res.status(200).json({
            message: `Product ${
                product.isActive ? "enabled" : "disabled"
            } successfully`,
            product
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


const updateProductStock = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const {
            size,
            stock
        } = req.body;

        // Check required fields
        if (
            size === undefined ||
            stock === undefined
        ) {
            return res.status(400).json({
                message: "Size and stock are required"
            });
        }

        // Stock cannot be negative
        if (stock < 0) {
            return res.status(400).json({
                message: "Stock cannot be negative"
            });
        }

        // Find the requested size
        const sizeItem = product.sizes.find(
            item => item.size === Number(size)
        );

        if (!sizeItem) {
            return res.status(404).json({
                message: "Size not found for this product"
            });
        }

        // Update stock
        sizeItem.stock = stock;

        await product.save();

        res.status(200).json({
            message: "Product stock updated successfully",
            product
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    createProduct,
    getProducts,
    getAdminProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    updateProductStock
};