const Order = require("../models/Order");

const getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                message: "Start date and end date are required"
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        end.setHours(23, 59, 59, 999);

        const orders = await Order.find({
            createdAt: {
                $gte: start,
                $lte: end
            },
            orderStatus: "Completed"
        });

        const totalOrders = orders.length;

        const totalSales = orders.reduce(
            (total, order) => total + order.totalAmount,
            0
        );
         
         const dailySales = {};

orders.forEach((order) => {
    const date = order.createdAt.toISOString().split("T")[0];

    if (!dailySales[date]) {
        dailySales[date] = {
            orders: 0,
            sales: 0
        };
    }

    dailySales[date].orders += 1;
    dailySales[date].sales += order.totalAmount;
});

const salesByBrand = {};

orders.forEach((order) => {
    order.items.forEach((item) => {
        if (!salesByBrand[item.brand]) {
            salesByBrand[item.brand] = 0;
        }

        salesByBrand[item.brand] += item.price;
    });
});

const salesByCategory = {};

orders.forEach((order) => {
    order.items.forEach((item) => {
        if (!salesByCategory[item.category]) {
            salesByCategory[item.category] = 0;
        }
        salesByCategory[item.category] += item.price;
    });
});

        res.status(200).json({
            message: "Sales report fetched successfully",
            startDate,
            endDate,
            totalOrders,
            totalSales,
            dailySales,
            salesByBrand,
            salesByCategory
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = {
    getSalesReport
};