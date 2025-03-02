import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { getUserByEmail } from "../services/userService.js";



export const login = async (req, res) => {
  if (!req.body.email || req.body.email === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide email",
    });
  }
  if (!req.body.password || req.body.password === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide password",
    });
  }
  let user = await getUserByEmail(req.body.email);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid email or password",
    });
  }
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).json({
      success: false,
      message: "Invalid email or password",
    });
  }
  if (user.status !== "active") {
    return res.status(400).json({
      success: false,
      message: "Your account is not active",
    });
  }
  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    token: generateToken(user.id),
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      restaurents: user.restaurents,
      gender: user.gender,
      address: user.address,
      image: user.image,
      departmentId: user.departmentId,
      rank: user.rank,
      armyid: user.armyid,
      joindate: user.joindate,
    },
  });
};

export const forgotPassword = async (req, res) => {
  if (!req.body.email || req.body.email === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide email",
    });
  }
  const user = await getUserByEmail(req.body.email);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid email",
    });
  }
  return res.status(200).json({
    success: true,
    message: "Password reset link sent to your email",
  });
};

export const resetPassword = async (req, res) => {
  if (!req.body.password || req.body.password === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide password",
    });
  }
  if (!req.body.confirmPassword || req.body.confirmPassword === "") {
    return res.status(400).json({
      success: false,
      message: "Please provide confirmPassword",
    });
  }
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "password and confirmPassword does not match",
    });
  }
  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
};

// generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
