const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const generateReceipt = require("../utils/generateReceipt");
const sendEmail = require("../utils/sendEmail");
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json({
            message: "Order fetched successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const downloadReceipt = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        generateReceipt(order, res);

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.user.id
        })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Orders fetched successfully",
            orders
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const createOrder = async (req, res) => {
    try {
        const {
            fullName,
            phone,
            address,
            city,
            state,
            pincode
        } = req.body.deliveryAddress||{};

        // Check delivery address fields
        if (
            !fullName ||
            !phone ||
            !address ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                message: "All delivery address fields are required"
            });
        }
         

        const user = await User.findById(req.user.id);

        if (!user) {
    return res.status(404).json({
        message: "User not found"
    });
    }
        // Find customer's cart
        const cart = await Cart.findOne({
            user: req.user.id
        });


        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        // Get product details
        const productIds = cart.items.map(
            item => item.product
        );

        const products = await Product.find({
            _id: { $in: productIds }
        });

        const orderItems = [];
        let totalAmount = 0;

        // Validate every cart item
        for (const cartItem of cart.items) {

            const product = products.find(
                item =>
                    item._id.toString() ===
                    cartItem.product.toString()
            );

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            if (!product.isActive) {
                return res.status(400).json({
                    message: `${product.model} is currently unavailable`
                });
            }

            // Find selected size
            const sizeItem = product.sizes.find(
                item =>
                    item.size === cartItem.size
            );

            if (!sizeItem) {
                return res.status(400).json({
                    message: `Size ${cartItem.size} is not available for ${product.model}`
                });
            }

            // Check stock
            if (sizeItem.stock <= 0) {
                return res.status(400).json({
                    message: `${product.model}, size ${cartItem.size} is out of stock`
                });
            }

            // Add product snapshot to order
            orderItems.push({
                product: product._id,
                brand: product.brand,
                category: product.category,
                model: product.model,
                size: cartItem.size,
                price: product.price,
                image: product.images.length > 0
                    ? product.images[0]
                    : ""
            });

            totalAmount += product.price;
        }

        // Generate order number
        const orderNumber =
            "ORD-" +
            Date.now();

        // Create order
        const order = await Order.create({
            orderNumber,
            user: req.user.id,
            items: orderItems,
            deliveryAddress: {
                fullName,
                phone,
                address,
                city,
                state,
                pincode
            },
            totalAmount,
            paymentMethod: "COD",
            orderStatus: "Pending"
        });

        // Reduce stock for each purchased size
        for (const cartItem of cart.items) {

            const product = await Product.findById(
                cartItem.product
            );

            const sizeItem = product.sizes.find(
                item =>
                    item.size === cartItem.size
            );

            sizeItem.stock -= 1;

            await product.save();
        }

        // Clear cart
cart.items = [];
await cart.save();

const pdfBuffer = await generateReceipt(order);

await sendEmail(
    user.email,
    `Order Receipt - ${order.orderNumber}`,
    `Thank you for your order. Your receipt for order ${order.orderNumber} is attached.`,
    pdfBuffer,
    `${order.orderNumber}.pdf`
);

res.status(201).json({
    message: "Order created successfully",
    order
});
        await cart.save();

        res.status(201).json({
            message: "Order created successfully",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};


module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    downloadReceipt
};