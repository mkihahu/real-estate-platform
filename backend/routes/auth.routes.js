import express from "express";
import {
  forgotPassword,
  getProfile,
  login,
  register,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/profile", protect, getProfile);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password/:token", resetPassword);

export default authRouter;
