import { findUserById } from "../Repositories/userRepository.js";
import { verifyJwt } from "../Utils/jwt.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization ?? "";

    if (!authHeader.startsWith("Bearer ")) {
      res.status(401);
      throw new Error("Authorization token is required");
    }

    const token = authHeader.slice(7);
    const payload = verifyJwt(token);
    const user = await findUserById(payload.sub);

    if (!user) {
      res.status(401);
      throw new Error("User not found for this token");
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    next();
  } catch (error) {
    if (!res.statusCode || res.statusCode < 400) {
      res.status(401);
    }

    next(error);
  }
};

export default protect;
