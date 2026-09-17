const blockedKeys = new Set([
  "__proto__",
  "prototype",
  "constructor",
]);

const sanitizeValue = (value) => {
  if (!value || typeof value !== "object") {
    return;
  }

  for (const key of Object.keys(value)) {
    if (
      key.startsWith("$") ||
      key.includes(".") ||
      blockedKeys.has(key)
    ) {
      delete value[key];
      continue;
    }

    sanitizeValue(value[key]);
  }
};

const sanitizeRequest = (req, res, next) => {
  sanitizeValue(req.body);
  sanitizeValue(req.query);
  sanitizeValue(req.params);

  return next();
};

module.exports = sanitizeRequest;
