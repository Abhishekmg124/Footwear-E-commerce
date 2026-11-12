const Cart = require("../models/Cart");
const Product = require("../models/Product");


const addToCart = async (req, res) => {
    try {
        const { productId, size } = req.body;

        // Check required fields
        if (!productId || size === undefined) {
            return res.status(400).json({
                message: "Product ID and size are required"
            });
        }

        // Find the product
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        // Check whether product is active
        if (!product.isActive) {
            return res.status(400).json({
                message: "Product is currently unavailable"
            });
        }

        // Find the selected size
        const sizeItem = product.sizes.find(
            item => item.size === Number(size)
        );

        if (!sizeItem) {
            return res.status(400).json({
                message: "Selected size is not available"
            });
        }

        // Check stock
        if (sizeItem.stock <= 0) {
            return res.status(400).json({
                message: "Selected size is out of stock"
            });
        }

        // Find the customer's cart
        let cart = await Cart.findOne({
            user: req.user.id
        });

        // If cart doesn't exist, create one
        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: [
                    {
                        product: productId,
                        size: Number(size)
                    }
                ]
            });

            return res.status(201).json({
                message: "Product added to cart successfully",
                cart
            });
        }

        // Check if the same product with the same size
        // is already in the cart
        const itemExists = cart.items.some(
            item =>
                item.product.toString() === productId &&
                item.size === Number(size)
        );

        if (itemExists) {
            return res.status(400).json({
                message: "Product with this size is already in cart"
            });
        }

        // Add product to existing cart
        cart.items.push({
            product: productId,
            size: Number(size)
        });

        await cart.save();

        res.status(200).json({
            message: "Product added to cart successfully",
            cart
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    addToCart
};

const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.user.id
        }).populate(
            "items.product",
            "brand category model price images isActive sizes"
        );

        if (!cart) {
            return res.status(200).json({
                message: "Cart is empty",
                cart: {
                    items: []
                }
            });
        }

        res.status(200).json({
            message: "Cart fetched successfully",
            cart
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    addToCart,
    getCart
};

const removeFromCart = async (req, res) => {
    try {
        const { productId, size } = req.params;

        // Find customer's cart
        const cart = await Cart.findOne({
            user: req.user.id
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        // Find the item
        const itemExists = cart.items.some(
            item =>
                item.product.toString() === productId &&
                item.size === Number(size)
        );

        if (!itemExists) {
            return res.status(404).json({
                message: "Product with this size not found in cart"
            });
        }

        // Remove the item
        cart.items = cart.items.filter(
            item =>
                !(
                    item.product.toString() === productId &&
                    item.size === Number(size)
                )
        );

        await cart.save();

        res.status(200).json({
            message: "Product removed from cart successfully",
            cart
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    removeFromCart
};