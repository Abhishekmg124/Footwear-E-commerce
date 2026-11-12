const mongoose = require("mongoose");

const sizeStockSchema = new mongoose.Schema(
    {
        size: {
            type: Number,
            required: true
        },

        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        }
    },
    {
        _id: false
    }
);

const productSchema = new mongoose.Schema(
    {
        brand: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        model: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        sizes: {
            type: [sizeStockSchema],
            required: true
        },

        images: {
            type: [String],
            default: []
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;