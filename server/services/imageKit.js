const fs = require("fs/promises");
const ImageKit = require("@imagekit/nodejs").default;
const { toFile } = require("@imagekit/nodejs");
const { env } = require("../config/env");

let client;

const getClient = () => {
  if (!client) {
    client = new ImageKit({
      privateKey: env.imageKitPrivateKey,
    });
  }

  return client;
};

const uploadImage = async ({ filePath, fileName, folder }) => {
  const buffer = await fs.readFile(filePath);

  const result = await getClient().files.upload({
    file: await toFile(buffer, fileName),
    fileName,
    folder: `/fullstack-portfolio/${folder}`,
    useUniqueFileName: true,
  });

  return {
    url: result.url,
    fileId: result.fileId,
  };
};

const deleteImage = async (fileId) => {
  if (!fileId) return;

  try {
    await getClient().files.delete(fileId);
  } catch (error) {
    const statusCode = error.statusCode || error.status;

    if (statusCode !== 404) {
      throw error;
    }
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
