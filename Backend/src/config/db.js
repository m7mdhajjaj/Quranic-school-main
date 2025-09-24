const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    // Remove deprecated options
    const conn = await mongoose.connect(process.env.MONGODB_URI);
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

    // Don't exit process in development - allow nodemon to restart
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
