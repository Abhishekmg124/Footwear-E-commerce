const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        brand: {
            type: String,
            required: true
        },

        category: {
             type: String,
             required: true
},

        model: {
            type: String,
            required: true
        },

        size: {
            type: Number,
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        image: {
            type: String,
            default: ""
        }
    },
    {
        _id: false
    }
);

const deliveryAddressSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        state: {
            type: String,
            required: true,
            trim: true
        },

        pincode: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        _id: false
    }
);


const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        items: {
            type: [orderItemSchema],
            required: true
        },

        deliveryAddress: {
            type: deliveryAddressSchema,
            required: true
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMethod: {
            type: String,
            enum: ["COD"],
            default: "COD"
        },

        orderStatus: {
            type: String,
            enum: [
                "Pending",
                "Dispatched",
                "Completed",
                "Returned"
            ],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;