import jwt from "jsonwebtoken";
import User from "../../auth/schema/auth.modal.js";

const userMiddleware = async (req, res, next) => {
  try {
    const token =
      (req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null) ||
      req.cookies?.accessToken ||
      req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || process.env.PRV_TOKEN
    );

    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: "Invalid token",
      });
    }

    const user = await User.findById(decoded._id || decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    if (user.isDeleted) {
       return res.status(403).json({
        success: false,
        message: "Account has been deleted.",
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

export default userMiddleware;
