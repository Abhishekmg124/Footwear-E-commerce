const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME?.trim() || "Store Admin";

        if (!process.env.MONGO_URI || !adminEmail || !adminPassword || adminPassword.length < 8) {
            throw new Error("Set MONGO_URI, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 8 characters in backend/.env");
        }

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const existingAdmin = await User.findOne({
            email: adminEmail
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            adminPassword,
            10
        );

        const admin = await User.create({
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin created successfully");
        console.log("Email:", admin.email);
        console.log("Role:", admin.role);

        process.exit(0);

    } catch (error) {
        console.error("Error creating admin:", error.message);
        process.exit(1);
    }
};

createAdmin();