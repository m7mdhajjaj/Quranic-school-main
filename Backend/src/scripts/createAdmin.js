const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import the Admin model
const Admin = require("../models/Admin");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected for admin creation script"))
  .catch((err) => console.error("MongoDB connection error:", err));

const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ adminId: 1 });

    if (existingAdmin) {
      console.log("Admin account already exists");
      return mongoose.disconnect();
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // Create admin account
    const newAdmin = new Admin({
      adminId: 1,
      firstName: "Admin",
      lastName: "User",
      email: "admin@quranicschool.com",
      phoneNumber: "0500000000",
      password: hashedPassword,
      isActive: true,
    });

    await newAdmin.save();
    console.log("Default admin account created successfully!");
    console.log("AdminID: 1");
    console.log("Password: admin123");

    // Disconnect from MongoDB
    mongoose.disconnect();
  } catch (error) {
    console.error("Error creating default admin:", error);
    mongoose.disconnect();
  }
};

// Run the function
createDefaultAdmin();
