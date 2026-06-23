const swaggerJSDoc = require("swagger-jsdoc");

// 1. Yangi uploadDocs ni import qilamiz
const authDocs = require("./swagger/authDocs");
const aboutDocs = require("./swagger/aboutDocs");
const projectDocs = require("./swagger/projectDocs");
const contactDocs = require("./swagger/contactDocs");
const faqDocs = require("./swagger/faqDocs");
const uploadDocs = require("./swagger/uploadDocs"); // <--- Import

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Asilbek's Full-Stack Portfolio API",
      version: "1.0.0",
      description: "...",
    },
    servers: [
      {
        url: "https://fullstack-portfolio-81mm.onrender.com",
        description: "Render Jonli Server",
      },
      { url: "http://localhost:8080", description: "Local Development Server" },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "token",
          description:
            "Adminlarni autentifikatsiya qilish uchun ishlatiladigan JWT kuki fayli.",
        },
      },
      schemas: {
        Admin: authDocs.schema,
        About: aboutDocs.schema,
        Project: projectDocs.schema,
        Contact: contactDocs.schema,
        FAQ: faqDocs.schema,
        // Upload uchun alohida sxema shart emas, chunki u oddiy obyekt qaytaradi
      },
    },
    paths: {
      ...authDocs.paths,
      ...aboutDocs.paths,
      ...projectDocs.paths,
      ...contactDocs.paths,
      ...faqDocs.paths,
      ...uploadDocs.paths, // <--- Mana bu yerda yo'lni qo'shamiz
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
