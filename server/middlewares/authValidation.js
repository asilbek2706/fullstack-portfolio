const hasOwn = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);

const rejectUnknownFields = (body, allowedFields) => {
  const unknownFields = Object.keys(body).filter(
    (field) => !allowedFields.includes(field),
  );

  return unknownFields.length > 0
    ? `Ruxsat etilmagan maydonlar: ${unknownFields.join(", ")}`
    : null;
};

const normalizeUsername = (username) => username.trim();
const normalizeEmail = (email) => email.trim().toLowerCase();

const usernamePattern = /^[A-Za-z0-9._-]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateUsername = (username) => {
  if (typeof username !== "string") {
    return "Username matn ko'rinishida bo'lishi kerak.";
  }

  const normalized = normalizeUsername(username);

  if (normalized.length < 3 || normalized.length > 32) {
    return "Username 3 va 32 ta belgi oralig'ida bo'lishi kerak.";
  }

  if (!usernamePattern.test(normalized)) {
    return "Username faqat harf, raqam, nuqta, pastki chiziq va chiziqchadan iborat bo'lishi mumkin.";
  }

  return null;
};

const validateEmail = (email) => {
  if (typeof email !== "string") {
    return "Email matn ko'rinishida bo'lishi kerak.";
  }

  const normalized = normalizeEmail(email);

  if (normalized.length > 254 || !emailPattern.test(normalized)) {
    return "Email formati noto'g'ri.";
  }

  return null;
};

const validatePassword = (password) => {
  if (typeof password !== "string") {
    return "Parol matn ko'rinishida bo'lishi kerak.";
  }

  if (password.length < 8) {
    return "Parol kamida 8 ta belgidan iborat bo'lishi kerak.";
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    return "Parol UTF-8 formatida 72 baytdan oshmasligi kerak.";
  }

  return null;
};

const sendValidationError = (res, message) =>
  res.status(400).json({
    success: false,
    message,
  });

const validateLogin = (req, res, next) => {
  const body = req.body || {};
  const unknownError = rejectUnknownFields(body, [
    "username",
    "password",
  ]);

  if (unknownError) {
    return sendValidationError(res, unknownError);
  }

  const usernameError = validateUsername(body.username);
  if (usernameError) {
    return sendValidationError(res, "Login yoki parol noto'g'ri.");
  }

  if (
    typeof body.password !== "string" ||
    !body.password ||
    Buffer.byteLength(body.password, "utf8") > 72
  ) {
    return sendValidationError(res, "Login yoki parol noto'g'ri.");
  }

  req.body.username = normalizeUsername(body.username);
  return next();
};

const validateInviteAdmin = (req, res, next) => {
  const body = req.body || {};
  const unknownError = rejectUnknownFields(body, [
    "username",
    "email",
    "password",
  ]);

  if (unknownError) {
    return sendValidationError(res, unknownError);
  }

  const usernameError = validateUsername(body.username);
  if (usernameError) return sendValidationError(res, usernameError);

  const emailError = validateEmail(body.email);
  if (emailError) return sendValidationError(res, emailError);

  const passwordError = validatePassword(body.password);
  if (passwordError) return sendValidationError(res, passwordError);

  req.body.username = normalizeUsername(body.username);
  req.body.email = normalizeEmail(body.email);

  return next();
};

const validateUpdateMe = (req, res, next) => {
  const body = req.body || {};
  const allowedFields = ["username", "email", "password"];
  const unknownError = rejectUnknownFields(body, allowedFields);

  if (unknownError) {
    return sendValidationError(res, unknownError);
  }

  const suppliedFields = allowedFields.filter((field) =>
    hasOwn(body, field),
  );

  if (suppliedFields.length === 0) {
    return sendValidationError(
      res,
      "Yangilash uchun kamida bitta maydon yuboring.",
    );
  }

  if (hasOwn(body, "username")) {
    const error = validateUsername(body.username);
    if (error) return sendValidationError(res, error);
    req.body.username = normalizeUsername(body.username);
  }

  if (hasOwn(body, "email")) {
    const error = validateEmail(body.email);
    if (error) return sendValidationError(res, error);
    req.body.email = normalizeEmail(body.email);
  }

  if (hasOwn(body, "password")) {
    const error = validatePassword(body.password);
    if (error) return sendValidationError(res, error);
  }

  return next();
};

const validateAdminUpdate = (req, res, next) => {
  const body = req.body || {};
  const unknownError = rejectUnknownFields(body, [
    "username",
    "email",
    "role",
  ]);

  if (unknownError) {
    return sendValidationError(res, unknownError);
  }

  const usernameError = validateUsername(body.username);
  if (usernameError) return sendValidationError(res, usernameError);

  const emailError = validateEmail(body.email);
  if (emailError) return sendValidationError(res, emailError);

  if (!["admin", "superadmin"].includes(body.role)) {
    return sendValidationError(
      res,
      "Role faqat admin yoki superadmin bo'lishi mumkin.",
    );
  }

  req.body.username = normalizeUsername(body.username);
  req.body.email = normalizeEmail(body.email);

  return next();
};

module.exports = {
  validateLogin,
  validateInviteAdmin,
  validateUpdateMe,
  validateAdminUpdate,
};
