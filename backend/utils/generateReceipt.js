const PDFDocument = require("pdfkit");

const generateReceipt = (order, res = null) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const chunks = [];

            doc.on("data", (chunk) => {
                chunks.push(chunk);
            });

            doc.on("end", () => {
                const pdfBuffer = Buffer.concat(chunks);

                // If an HTTP response was provided,
                // send the PDF to the browser.
                if (res) {
                    res.setHeader("Content-Type", "application/pdf");
                    res.setHeader(
                        "Content-Disposition",
                        `attachment; filename=${order.orderNumber}.pdf`
                    );

                    res.end(pdfBuffer);
                }

                resolve(pdfBuffer);
            });

            doc.on("error", reject);

            doc.fontSize(22).text("FOOTWEAR STORE", { align: "center" });
            doc.moveDown();

            doc.fontSize(16).text("ORDER RECEIPT", { align: "center" });
            doc.moveDown(2);

            doc.fontSize(11).text(`Order Number: ${order.orderNumber}`);
            doc.text(`Order Date: ${order.createdAt.toLocaleDateString()}`);
            doc.text(`Payment Method: ${order.paymentMethod}`);
            doc.text(`Order Status: ${order.orderStatus}`);
            doc.moveDown();

            doc.fontSize(14).text("Delivery Address");
            doc.moveDown(0.5);

            doc.fontSize(11).text(`Name: ${order.deliveryAddress.fullName}`);
            doc.text(`Phone: ${order.deliveryAddress.phone}`);
            doc.text(`Address: ${order.deliveryAddress.address}`);
            doc.text(`City: ${order.deliveryAddress.city}`);
            doc.text(`State: ${order.deliveryAddress.state}`);
            doc.text(`Pincode: ${order.deliveryAddress.pincode}`);
            doc.moveDown();

            doc.fontSize(14).text("Order Items");
            doc.moveDown(0.5);

            order.items.forEach((item, index) => {
                doc.fontSize(11).text(
                    `${index + 1}. ${item.brand} ${item.model}`
                );
                doc.text(`   Size: ${item.size}`);
                doc.text(`   Price: INR ${item.price}`);
                doc.moveDown(0.5);
            });

            doc.moveDown();

            doc.fontSize(15).text(
                `Total Amount: INR ${order.totalAmount}`,
                { align: "right" }
            );

            doc.moveDown(2);

            doc.fontSize(10).text(
                "Thank you for shopping with Footwear Store!",
                { align: "center" }
            );

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generateReceipt;