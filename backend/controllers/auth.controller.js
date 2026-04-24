import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString(); // Generate a 6-digit code

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      isApproved: role === "seller" ? false : true, // Sellers need approval
      verificationCode,
      verificationCodeExpires: new Date(Date.now() + 10 * 60 * 1000), // Expires in 10 minutes
    });

    try {
      await sendEmail({
        email,
        subject: "Verify Your Email - Josmart Real Estate Platform",
        message: `
          <h1>Email Verification</h1>
          <p>Thank you for registering on Josmart Real Estate Platform. Please use the following verification code to verify your email address:</p>
          <h2>${verificationCode}</h2>
          <p>This code will expire in 10 minutes.</p>
        `,
      });
    } catch (emailError) {
      console.error(
        "Error occurred while sending verification email:",
        emailError,
      );
    }

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for verification instructions.",
      user: {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before logging in" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked. Please contact support.",
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.json({
      token,
      user: { email: user.email, name: user.name, role: user.role },
      message: "Login successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user, success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// verify email
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Check if verification code has expired
    if (
      user.verificationCodeExpires &&
      user.verificationCodeExpires < new Date()
    ) {
      return res.status(400).json({
        message: "Verification code has expired. Please register again.",
      });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ message: "Email verified successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with that email address" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    const clientUrl = "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
    const message = `
            <h2>Password Reset Request</h2>
            <p>You requested a password reset. Please click on the link below to reset your password:</p>
            <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
            <p>This link will expire in 15 minutes.</p>
        `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset - Josmart Real Estate Platform",
        message,
      });
      res
        .status(200)
        .json({ message: "Password reset email sent", success: true });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res
        .status(500)
        .json({ message: "Could not send email", success: false });
    }
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired password reset token.",
        success: false,
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.status(200).json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
};
