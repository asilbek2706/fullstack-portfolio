const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const inquirer = require("inquirer");

const Admin = require("../models/Admin");
const { env } = require("../config/env");

const usernamePattern = /^[A-Za-z0-9._-]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateUsername = async (value) => {
  const username = value.trim();

  if (username.length < 3 || username.length > 32) {
    return "Username 3 va 32 ta belgi oralig'ida bo'lishi kerak.";
  }

  if (!usernamePattern.test(username)) {
    return "Username formati noto'g'ri.";
  }

  const existingAdmin = await Admin.exists({ username });

  return existingAdmin ? "Bu username allaqachon band." : true;
};

const validateEmail = async (value) => {
  const email = value.trim().toLowerCase();

  if (email.length > 254 || !emailPattern.test(email)) {
    return "Email formati noto'g'ri.";
  }

  const existingAdmin = await Admin.exists({ email });

  return existingAdmin ? "Bu email allaqachon ro'yxatdan o'tgan." : true;
};

const validatePassword = (value) => {
  if (typeof value !== "string" || value.length < 8) {
    return "Parol kamida 8 ta belgidan iborat bo'lishi kerak.";
  }

  if (Buffer.byteLength(value, "utf8") > 72) {
    return "Parol UTF-8 formatida 72 baytdan oshmasligi kerak.";
  }

  return true;
};

const main = async () => {
  try {
    if (!env.mongoUri) {
      throw new Error(".env faylida MONGO_URI topilmadi.");
    }

    await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== "production",
      serverSelectionTimeoutMS: 10000,
    });

    const existingSuperAdmin = await Admin.exists({
      role: "superadmin",
    });

    if (existingSuperAdmin) {
      throw new Error(
        "Tizimda SuperAdmin mavjud. Yangi SuperAdmin yaratish bekor qilindi.",
      );
    }

    const identity = await inquirer.prompt([
      {
        type: "input",
        name: "username",
        message: "Yangi SuperAdmin username:",
        default: "user",
        filter: (value) => value.trim(),
        validate: validateUsername,
      },
      {
        type: "input",
        name: "email",
        message: "Email manzili:",
        filter: (value) => value.trim().toLowerCase(),
        validate: validateEmail,
      },
    ]);

    const passwordAnswer = await inquirer.prompt([
      {
        type: "password",
        name: "password",
        message: "Parol (kamida 8 ta belgi):",
        mask: "*",
        validate: validatePassword,
      },
    ]);

    const confirmation = await inquirer.prompt([
      {
        type: "password",
        name: "passwordConfirmation",
        message: "Parolni takrorlang:",
        mask: "*",
        validate: (value) =>
          value === passwordAnswer.password || "Parollar bir xil emas.",
      },
    ]);

    if (confirmation.passwordConfirmation !== passwordAnswer.password) {
      throw new Error("Parol tasdiqlanmadi.");
    }

    const hashedPassword = await bcrypt.hash(passwordAnswer.password, 12);

    const superAdmin = await Admin.create({
      username: identity.username,
      email: identity.email,
      password: hashedPassword,
      role: "superadmin",
    });

    console.log(
      `SuperAdmin "${superAdmin.username}" muvaffaqiyatli yaratildi.`,
    );
  } catch (error) {
    console.error("SuperAdmin yaratishda xatolik:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

main();
