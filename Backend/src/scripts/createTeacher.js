const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import the Teacher model
const Teacher = require("../models/Teacher");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected for teacher creation script"))
  .catch((err) => console.error("MongoDB connection error:", err));

const createDefaultTeacher = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Teacher.findOne({ teacherId: 1001 });

    if (existingAdmin) {
      console.log("Admin account already exists");
      return mongoose.disconnect();
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // Create admin account
    const newAdmin = new Teacher({
      teacherId: 1001,
      firstName: "Admin",
      lastName: "User",
      email: "admin@quranicschool.com",
      phoneNumber: "0500000000",
      password: hashedPassword,
      groups: ["All"],
      role: "admin",
    });

    await newAdmin.save();
    console.log("Default admin account created successfully!");
    console.log("TeacherID: 1001");
    console.log("Password: admin123");

    // Disconnect from MongoDB
    mongoose.disconnect();
  } catch (error) {
    console.error("Error creating default teacher:", error);
    mongoose.disconnect();
  }
};

// Run the function
createDefaultTeacher();
