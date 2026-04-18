import mongoose from "mongoose";

const userschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    profilePicture: {
      type: String,
    },

    isApproved: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
    },

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpires: {
      type: Date,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userschema);

export default User;
