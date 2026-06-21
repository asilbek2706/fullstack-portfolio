const swaggerJSDoc = require("swagger-jsdoc");

// Alohida fayllardagi Swagger hujjatlarini chaqirib olamiz
const authDocs = require("./swagger/authDocs");
const aboutDocs = require("./swagger/aboutDocs");
const projectDocs = require("./swagger/projectDocs");
const contactDocs = require("./swagger/contactDocs");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Asilbek's Full-Stack Portfolio API",
      version: "1.0.0",
      description:
        "Node.js, Express va MongoDB Atlas-da yozilgan, xavfsizligi va Telegram integratsiyasi ta'minlangan portfolio backend hujjatlari.",
    },
    servers: [
      {
        url: "https://fullstack-portfolio-81mm.onrender.com",
        description: "Render Jonli Server",
      },
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
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
      // Real ma'lumotlar bazasi sxemalarimiz (Hamma rowlar shu yerda paydo bo'ladi!)
      schemas: {
        Admin: authDocs.schema,
        About: aboutDocs.schema,
        Project: projectDocs.schema,
        Contact: contactDocs.schema,
      },
    },
    // Barcha fayllardan path'larni (endpointlarni) bitta obyektga birlashtiramiz
    paths: {
      ...authDocs.paths,
      ...aboutDocs.paths,
      ...projectDocs.paths,
      ...contactDocs.paths,
    },
  },
  apis: [], // Loyihadan ortiqcha sharhlarni o'qimasligi uchun bo'sh qoldiramiz
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
