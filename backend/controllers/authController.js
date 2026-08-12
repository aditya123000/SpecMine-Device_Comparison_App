import { createUser, findUserByEmail, updateUser } from "../repositories/userRepository.js";
import { hashPassword, verifyPassword } from "../utils/passwords.js";
import { signJwt } from "../utils/jwt.js";

const formatAuthResponse = (user) => ({
  token: signJwt({ sub: user.id, email: user.email }),
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  },
});

const formatUserResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const registerUser = async (req, res, next) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters long");
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(409);
      throw new Error("An account with this email already exists");
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, passwordHash });

    res.status(201).json(formatAuthResponse(user));
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await findUserByEmail(email);

    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    res.status(200).json(formatAuthResponse(user));
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res) => {
  res.status(200).json({ user: req.user });
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const name = req.body?.name ? String(req.body.name).trim() : undefined;
    const email = req.body?.email ? String(req.body.email).trim().toLowerCase() : undefined;

    if (!name && !email) {
      res.status(400);
      throw new Error("At least one field (name or email) is required");
    }

    if (name && name.length < 1) {
      res.status(400);
      throw new Error("Name cannot be empty");
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400);
      throw new Error("Invalid email format");
    }

    const user = await updateUser(userId, { name, email });

    res.status(200).json({ user: formatUserResponse(user) });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const currentPassword = String(req.body?.currentPassword ?? "");
    const newPassword = String(req.body?.newPassword ?? "");

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error("Current password and new password are required");
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error("New password must be at least 6 characters long");
    }

    // Get full user with password hash
    const user = await findUserByEmail(req.user.email);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const isPasswordValid = await verifyPassword(currentPassword, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401);
      throw new Error("Current password is incorrect");
    }

    const newPasswordHash = await hashPassword(newPassword);
    const updatedUser = await updateUser(userId, { passwordHash: newPasswordHash });

    res.status(200).json({ user: formatUserResponse(updatedUser) });
  } catch (error) {
    next(error);
  }
};

export { getCurrentUser, loginUser, registerUser, updateProfile, changePassword };
