const swaggerJSDoc = require("swagger-jsdoc");
const { components } = require("./swagger/common");
const systemDocs = require("./swagger/systemDocs");
const authDocs = require("./swagger/authDocs");
const aboutDocs = require("./swagger/aboutDocs");
const projectDocs = require("./swagger/projectDocs");
const contactDocs = require("./swagger/contactDocs");
const faqDocs = require("./swagger/faqDocs");
const uploadDocs = require("./swagger/uploadDocs");

const documents = [
  systemDocs,
  authDocs,
  aboutDocs,
  projectDocs,
  contactDocs,
  faqDocs,
  uploadDocs,
];

const domainSchemas = Object.assign(
  {},
  ...documents.map((document) => document.schemas || {}),
);
const paths = Object.assign({}, ...documents.map((document) => document.paths));

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Asilbek Full-Stack Portfolio API",
      version: "1.0.0",
      description:
        "Portfolio sayti, admin paneli, murojaatlar, Telegram javoblari va rasm yuklash uchun REST API.",
    },
    servers: [
      { url: "/", description: "Joriy server" },
      { url: "http://localhost:8080", description: "Mahalliy server" },
    ],
    tags: [
      { name: "System", description: "Health va readiness tekshiruvlari" },
      {
        name: "Authentication",
        description: "Admin sessiyasi va profil boshqaruvi",
      },
      {
        name: "Admin management",
        description: "SuperAdmin boshqaruv amallari",
      },
      { name: "About", description: "Portfolio egasi haqidagi ma’lumotlar" },
      { name: "Projects", description: "Loyihalar va ularning rasmlari" },
      {
        name: "Contacts",
        description: "Murojaatlar, tracking va Telegram webhook",
      },
      { name: "FAQ", description: "Tez-tez so‘raladigan savollar" },
      { name: "Uploads", description: "Umumiy rasm yuklash endpointi" },
    ],
    components: {
      ...components,
      schemas: {
        ...components.schemas,
        ...domainSchemas,
      },
    },
    paths,
  },
  apis: [],
};

module.exports = swaggerJSDoc(options);
