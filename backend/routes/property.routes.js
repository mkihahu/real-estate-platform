import express from "express";
import {
  addProperty,
  deleteProperty,
  getAllProperties,
  getMyProperties,
  getPropertyCounts,
  getPropertyDetails,
  getSellerdashboard,
  updateProperty,
  updatePropertyStatus,
} from "../controllers/property.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const propertyRouter = express.Router();

propertyRouter.get("/", getAllProperties);

// Protected seller routes
propertyRouter.post(
  "/",
  protect,
  authorize("seller"),
  upload.array("images", 10),
  addProperty,
);
propertyRouter.get("/my", protect, authorize("seller"), getMyProperties);
propertyRouter.put(
  "/:id",
  protect,
  authorize("seller"),
  upload.array("images", 10),
  updateProperty,
);

propertyRouter.delete("/:id", protect, authorize("seller"), deleteProperty);
propertyRouter.patch(
  "/:id/status",
  protect,
  authorize("seller"),
  updatePropertyStatus,
);

propertyRouter.get(
  "/seller/dashboard",
  protect,
  authorize("seller"),
  getSellerdashboard,
);

propertyRouter.get("/counts", getPropertyCounts);
propertyRouter.get("/:id", getPropertyDetails);

export default propertyRouter;
