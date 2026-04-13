const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const Admin = require("../src/schema/Admin");

async function findUniqueIdentity(baseAdminId) {
  const stamp = Date.now().toString().slice(-6);

  for (let i = 0; i < 1000; i += 1) {
    const suffix = `${baseAdminId}${stamp}${i}`.slice(-6);
    const email = `admin${baseAdminId}_${suffix}@quranicschool.com`;

    // Must start with 05 and have 10 digits in total.
    const phoneNumber = `05${suffix.slice(-6).padStart(6, "0")}00`;

    const [emailExists, phoneExists] = await Promise.all([
      Admin.exists({ email }),
      Admin.exists({ phoneNumber }),
    ]);

    if (!emailExists && !phoneExists) {
      return { email, phoneNumber };
    }
  }

  throw new Error("Could not generate unique email/phone for new admin");
}

async function createOrUpdateAdmin() {
  const adminIdRaw = process.argv[2] || "1";
  const password = process.argv[3];

  const adminId = Number(adminIdRaw);
  if (!Number.isInteger(adminId) || adminId < 1) {
    throw new Error("adminId must be a positive integer");
  }

  if (!password || String(password).trim().length === 0) {
    throw new Error("Password is required");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in Backend/.env");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  const hashedPassword = await bcrypt.hash(String(password), 12);

  const existing = await Admin.findOne({ adminId });

  if (existing) {
    existing.password = hashedPassword;
    await existing.save();
    console.log(`Updated existing admin with adminId=${adminId}`);
    console.log(`Mongo _id: ${existing._id}`);
    return;
  }

  const { email, phoneNumber } = await findUniqueIdentity(adminId);

  const created = await Admin.create({
    adminId,
    password: hashedPassword,
    firstName: "Admin",
    lastName: String(adminId),
    residence: "N/A",
    email,
    phoneNumber,
  });

  console.log(`Created new admin with adminId=${adminId}`);
  console.log(`Mongo _id: ${created._id}`);
  console.log(`Email: ${created.email}`);
  console.log(`Phone: ${created.phoneNumber}`);
}

createOrUpdateAdmin()
  .catch((error) => {
    console.error("Failed to create/update admin:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
