const path = require("path");
const { createImageUpload } = require("./createImageUpload");

const uploadPath = path.join(__dirname, "../uploads/projects");

module.exports = createImageUpload(uploadPath);
