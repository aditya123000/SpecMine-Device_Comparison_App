const fail = (message) => {
  const error = new Error(message);
  error.status = 400;
  error.code = "VALIDATION_ERROR";
  throw error;
};

const getBodyObject = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    fail("A JSON object is required");
  }
  return body;
};

const readString = (body, key, label, { required = false, trim = true, max = 256 } = {}) => {
  const value = body[key];
  if (value === undefined) {
    if (required) fail(`${label} is required`);
    return undefined;
  }
  if (typeof value !== "string") fail(`${label} must be a string`);
  const normalized = trim ? value.trim() : value;
  if (required && !normalized) fail(`${label} is required`);
  if (normalized.length > max) fail(`${label} must be at most ${max} characters`);
  return normalized;
};

const normalizeEmail = (value) => {
  const email = value.toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fail("Enter a valid email address");
  }
  return email;
};

const readPassword = (body, key, label, { required = false, minimum = 1 } = {}) => {
  const password = readString(body, key, label, { required, trim: false, max: 128 });
  if (password !== undefined && password.length < minimum) {
    fail(`${label} must be at least ${minimum} characters long`);
  }
  return password;
};

const validateRegisterPayload = (input) => {
  const body = getBodyObject(input);
  const name = readString(body, "name", "Name", { required: true, max: 80 });
  const email = normalizeEmail(readString(body, "email", "Email", { required: true, max: 254 }));
  const password = readPassword(body, "password", "Password", { required: true, minimum: 8 });
  return { name, email, password };
};

const validateLoginPayload = (input) => {
  const body = getBodyObject(input);
  const email = normalizeEmail(readString(body, "email", "Email", { required: true, max: 254 }));
  const password = readPassword(body, "password", "Password", { required: true });
  return { email, password };
};

const validateProfilePayload = (input) => {
  const body = getBodyObject(input);
  const name = readString(body, "name", "Name", { max: 80 });
  const emailValue = readString(body, "email", "Email", { max: 254 });
  if (name !== undefined && !name) fail("Name is required");
  if (name === undefined && emailValue === undefined) {
    fail("Provide a name or email address to update");
  }
  return {
    name,
    email: emailValue === undefined ? undefined : normalizeEmail(emailValue),
  };
};

const validatePasswordChangePayload = (input) => {
  const body = getBodyObject(input);
  const currentPassword = readPassword(body, "currentPassword", "Current password", { required: true });
  const newPassword = readPassword(body, "newPassword", "New password", { required: true, minimum: 8 });
  if (currentPassword === newPassword) fail("Choose a new password different from the current password");
  return { currentPassword, newPassword };
};

const validateComparisonPayload = (input) => {
  const body = getBodyObject(input);
  const name = body.name === undefined
    ? "Untitled comparison"
    : readString(body, "name", "Comparison name", { max: 80 });
  if (!name) fail("Comparison name cannot be empty");

  if (!Array.isArray(body.deviceIds) || body.deviceIds.length < 2 || body.deviceIds.length > 3) {
    fail("A comparison must contain two or three device IDs");
  }

  const deviceIds = body.deviceIds.map((value) => {
    if (typeof value !== "string" && !(typeof value === "number" && Number.isSafeInteger(value))) {
      fail("Device IDs must be strings or numbers");
    }
    const id = String(value).trim();
    if (!id || id.length > 100) fail("Each device ID must be between 1 and 100 characters");
    return id;
  });

  if (new Set(deviceIds).size !== deviceIds.length) fail("Device IDs must be unique");
  return { name, deviceIds };
};

const validateDeviceId = (input) => {
  if (typeof input !== "string" || !input.trim() || input.length > 100) {
    const error = new Error("Invalid device ID");
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }
  return input.trim();
};

const validateUuid = (input, label = "ID") => {
  if (typeof input !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input)) {
    const error = new Error(`Invalid ${label.toLowerCase()}`);
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    throw error;
  }
  return input;
};

const getComparableCategory = (device) => {
  const value = String(device?.category ?? device?.section ?? device?.type ?? "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .trim();
  const aliases = {
    phones: ["phone", "smartphone", "smartphones", "mobile", "mobiles", "cellphone"],
    laptops: ["laptop", "notebook", "ultrabook"],
    tablets: ["tablet", "tab", "ipad"],
    earbuds: ["earbud", "buds", "tws"],
    headphones: ["headphone", "headset"],
    tvs: ["tv", "television", "smarttv"],
  };
  for (const [category, names] of Object.entries(aliases)) {
    if (value === category || names.includes(value)) return category;
  }
  return value || "phones";
};

export {
  getComparableCategory,
  validateComparisonPayload,
  validateDeviceId,
  validateLoginPayload,
  validatePasswordChangePayload,
  validateProfilePayload,
  validateRegisterPayload,
  validateUuid,
};
