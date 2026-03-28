import { createUser, findUserByEmail } from "../Repositories/userRepository.js";
import { hashPassword, verifyPassword } from "../Utils/passwords.js";
import { signJwt } from "../Utils/jwt.js";

const formatAuthResponse = (user) => ({
  token: signJwt({ sub: user.id, email: user.email }),
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  },
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

export { getCurrentUser, loginUser, registerUser };
