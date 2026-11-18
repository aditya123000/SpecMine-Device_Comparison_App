import { createUser, findUserByEmail, updatePasswordAndRevokeSessions, updateUser } from "../repositories/userRepository.js";
import { hashPassword, verifyPassword } from "../utils/passwords.js";
import { createSession, revokeSession } from "../repositories/sessionRepository.js";
import {
  validateLoginPayload,
  validatePasswordChangePayload,
  validateProfilePayload,
  validateRegisterPayload,
} from "../validators/requestValidators.js";
import { sendData } from "../utils/apiResponse.js";

const formatAuthResponse = async (user) => {
  const session = await createSession(user.id);
  return { token: session.token, expiresAt: session.expiresAt, user: {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  }};
};

const formatUserResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = validateRegisterPayload(req.body);

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(409);
      throw new Error("An account with this email already exists");
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, passwordHash });

    sendData(res, 201, await formatAuthResponse(user));
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = validateLoginPayload(req.body);

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

    sendData(res, 200, await formatAuthResponse(user));
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res) => {
  sendData(res, 200, { user: req.user });
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email } = validateProfilePayload(req.body);

    const user = await updateUser(userId, { name, email });

    sendData(res, 200, { user: formatUserResponse(user) });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = validatePasswordChangePayload(req.body);

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
    const updatedUser = await updatePasswordAndRevokeSessions(userId, newPasswordHash);
    if (!updatedUser) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    sendData(res, 200, { user: formatUserResponse(updatedUser) });
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try { await revokeSession(req.sessionToken); res.status(204).end(); } catch (error) { next(error); }
};

export { getCurrentUser, loginUser, logoutUser, registerUser, updateProfile, changePassword };
