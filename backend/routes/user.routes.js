import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getProfile,
  getPublicProfile,
  updateProfile,
} from "../controllers/user.controller.js";
import upload from "../middleware/upload.middleware.js";

const userRouter = express.Router();

userRouter.get("/profile", protect, getProfile);
userRouter.put(
  "/profile",
  protect,
  upload.single("profilePicture"),
  updateProfile,
);
userRouter.get("/public/:id", getPublicProfile);

export default userRouter;
