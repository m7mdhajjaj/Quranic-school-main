const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    // Configure connection options for better error handling
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });
    
    // Configure mongoose buffering settings (valid options only)
    mongoose.set('bufferCommands', false);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Test the connection by listing collections
    const collections = await mongoose.connection.db.collections();
    console.log(
      "Available collections:",
      collections.map((c) => c.collectionName).join(", ") ||
        "No collections found",
    );

    // Test the Student model specifically
    try {
      const Student = require("../models/Student");
      const count = await Student.countDocuments();
      console.log(`Current student count: ${count}`);
    } catch (modelError) {
      console.error("Error testing Student model:", modelError);
    }
  } catch (error) {
    console.error("MongoDB Connection Error:");
    console.error(`Error name: ${error.name}`);
    console.error(`Error message: ${error.message}`);
    console.error("Full error:", error);

    // Check for common MongoDB connection issues
    if (error.message.includes("ENOTFOUND")) {
      console.error(
        "Cannot resolve MongoDB host. Check your network connection and MongoDB URI.",
      );
    } else if (error.message.includes("Authentication failed")) {
      console.error(
        "Authentication failed. Check your username and password in the MongoDB URI.",
      );
    } else if (error.message.includes("timed out")) {
      console.error(
        "Connection timed out. Check your network or MongoDB Atlas IP whitelist settings.",
      );
    }

    console.error(
      "Check your MONGODB_URI in .env file and make sure your MongoDB Atlas cluster is accessible",
    );
    console.error("Application cannot continue without database connection.");

    // Exit process in all environments - database connection is critical
    // Note: In development, nodemon will automatically restart the process
    process.exit(1);
  }
};

module.exports = connectDB;
