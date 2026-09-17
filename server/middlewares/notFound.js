const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: "So'ralgan endpoint topilmadi.",
  });
};

module.exports = notFound;
