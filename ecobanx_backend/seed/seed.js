require("dotenv-safe").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Admins } = require("../app/models/adminModel");


const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/zokko_wallet";



async function main() {
  try {
    console.log("🚀 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected.");
    const existing = await Admins.findOne({
      email: "admin@ecobanx.com",
    });

    if (existing) {
      console.log("⚠️ Admin already exists:", existing.email);
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Ecobanx@2026", 10);

    const phone = 9998088761;

    const admin = await Admins.create({
      name: "Super Administrator",
      email: "admin@ecobanx.com",
      password: hashedPassword,
      phone: phone,
      role: "admin",
      verifyStatus: true,
      unique_id: "ecobanx-admin-uuid-001",
    });

    console.log("✅ Admin account created successfully!");
    console.log(admin);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

main();
