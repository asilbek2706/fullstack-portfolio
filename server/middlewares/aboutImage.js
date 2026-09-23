const path = require("path");
const { createImageUpload } = require("./createImageUpload");

const uploadPath = path.join(__dirname, "../uploads/about");

module.exports = createImageUpload(uploadPath);
