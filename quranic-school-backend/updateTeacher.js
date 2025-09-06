const mongoose = require("mongoose");
const Teacher = require("./src/models/Teacher");
require("dotenv").config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const updateTeacherName = async () => {
  try {
    await connectDB();

    // Find the teacher with firstName "Admin" and update to "محمد حجاج"
    const result = await Teacher.updateMany(
      {
        $or: [
          { firstName: "Admin" },
          { firstName: "admin" },
          { firstName: "ADMIN" },
        ],
      },
      {
        $set: {
          firstName: "محمد",
          lastName: "حجاج",
        },
      }
    );

    console.log("Update result:", result);

    // Also check if there are any teachers with the name pattern
    const teachers = await Teacher.find({});
    console.log("All teachers in database:");
    teachers.forEach((teacher) => {
      console.log(
        `ID: ${teacher._id}, Name: ${teacher.firstName} ${teacher.lastName}, Role: ${teacher.role}`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error updating teacher:", error);
    process.exit(1);
  }
};

updateTeacherName();
