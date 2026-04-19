import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
    },

    role: {
      type: String,
      enum: ["buyer", "seller"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
  { temestamps: true },
);

export default mongoose.model("Contact", contactSchema);
