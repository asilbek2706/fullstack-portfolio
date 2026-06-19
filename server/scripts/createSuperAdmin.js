const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");
const inquirer = require("inquirer");
require("dotenv").config();

const Admin = require("../models/Admin");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

async function main() {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ Xatolik: .env faylida MONGO_URI topilmadi!");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("\n🍃 MongoDB-ga xavfsiz ulandik. SuperAdmin yaratish jarayoni boshlandi...");
    console.log("------------------------------------");

    let username = "";
    let email = "";
    let password = "";

    // 1. Username kiritish
    while (true) {
      const inputUsername = await askQuestion(
        "🔑 Yangi SuperAdmin uchun login (username) kiriting (Default: 'user'): ",
      );

      username = inputUsername.trim() === "" ? "user" : inputUsername.trim();

      const existingUser = await Admin.findOne({ username });
      if (existingUser) {
        console.log(`❌ Xatolik: "${username}" logini allaqachon band! Qayta urinib ko'ring.\n`);
        continue;
      }
      break;
    }

    // 2. Email kiritish
    while (true) {
      const inputEmail = await askQuestion("📧 Email manzilini kiriting: ");
      email = inputEmail.trim();

      if (email === "") {
        console.log("❌ Xatolik: Email bo'sh bo'lishi mumkin emas!\n");
        continue;
      }
      if (!validateEmail(email)) {
        console.log("❌ Xatolik: Email formati noto'g'ri! (Masalan: admin@example.com)\n");
        continue;
      }

      const existingEmail = await Admin.findOne({ email: email.toLowerCase() });
      if (existingEmail) {
        console.log(`❌ Xatolik: "${email}" email manzili allaqachon ro'yxatdan o'tgan!\n`);
        continue;
      }
      break;
    }

    // Readline interfeysini yopamiz, chunki Inquirer o'z interfeysini ochadi
    rl.close();

    // 3. Parol kiritish (Inquirer tsikli)
    while (true) {
      const result = await inquirer.prompt([
        {
          type: "password",
          name: "inputPassword",
          message: "🔒 Parol kiriting (kamida 4 ta belgi):",
          mask: "*",
        },
      ]);

      password = result.inputPassword;

      if (!password || password.length < 4) {
        console.log("❌ Xatolik: Parol juda qisqa! Kamida 4 ta belgi bo'lishi shart.\n");
        continue;
      }
      break;
    }

    // 4. Parolni shifrlash va Saqlash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const superAdmin = new Admin({
      username: username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "superadmin",
    });

    await superAdmin.save();
    console.log("------------------------------------");
    console.log(`🎉 Tabriklayman! SuperAdmin "${username}" muvaffaqiyatli yaratildi!`);
    console.log("------------------------------------");

  } catch (error) {
    console.error("❌ Kutilmagan xatolik yuz berdi:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();