import express from "express";
import {
  createContact,
  getAllContacts,
} from "../controllers/contact.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const contactRouter = new express.Router();

contactRouter.post("/", createContact);
contactRouter.get("/", protect, authorize("admin"), getAllContacts);

export default contactRouter;
