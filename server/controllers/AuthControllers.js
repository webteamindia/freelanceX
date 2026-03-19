import jwt from "jsonwebtoken";
import crypto from "crypto";
import pkg from "@prisma/client";
const { Prisma } = pkg;
import prisma from "../prisma/client.js";
import { loginUser, registerUser, generatePassword } from "../services/authService.js";
import { sendMail } from "../utils/mailer.js";

const maxAge = 3 * 24 * 60 * 60;

const generateToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await registerUser({ email, password });

    return res.status(200).json({
      user: { id: user.id, email: user.email },
      jwt: generateToken(email, user.id),
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser({ email, password });
    return res.status(200).json({
      user: { id: user.id, email: user.email },
      jwt: generateToken(email, user.id),
      message: "Login successful",
    });
  } catch (err) {
    next(err);
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { password, ...userWithoutPassword } = user;
    return res.status(200).json({ user: userWithoutPassword });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const setUserInfo = async (req, res, next) => {
  try {
    if (req?.userId) {
      const { userName, fullName, description } = req.body;
      if (userName && fullName && description) {
        // Check if username is used by a different user
        const userNameValid = await prisma.user.findFirst({
          where: {
            username: userName,
            NOT: { id: req.userId },
          },
        });
        if (userNameValid) {
          return res.status(200).json({ userNameError: true });
        }

        await prisma.user.update({
          where: { id: req.userId },
          data: {
            username: userName,
            fullName,
            description,
            isProfileInfoSet: true,
          },
        });
        return res.status(200).send("Profile info set successfully");
      }
    } else {
      return res
        .status(400)
        .send("Username, Full name and Description are required");
    }
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        return res.status(400).json({ userNameError: true });
      }
    } else {
      return res.status(500).send("Internal Server Error");
    }
    throw err;
  }
};

export const setUserImage = async (req, res, next) => {
  try {
    if (req.file) {
      if (req.userId) {
        console.log(req.file);

        // Cloudinary automatically handles the upload and provides the URL
        const imageUrl = req.file.path; // This is the Cloudinary URL
        await prisma.user.update({
          where: { id: req.userId },
          data: { profileImage: imageUrl },
        });
        return res.status(200).json({ img: imageUrl });
      }
      return res.status(400).send("Cookie error");
    }
    return res.status(400).send("Image is required");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // For security, always return a generic response, even if user is not found
    if (!user) {
      return res.status(200).json({
        message:
          "If an account with that email exists, we have sent a password reset link.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.PUBLIC_URL}/reset-password?token=${token}`;

    await sendMail({
      to: email,
      subject: "Reset your ffiver password",
      text: `You requested a password reset for your ffiver account.\n\nClick the link below to set a new password:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
      html: `<p>You requested a password reset for your ffiver account.</p>
             <p><a href="${resetUrl}">Click here to set a new password</a></p>
             <p>If you did not request this, you can ignore this email.</p>`,
    });

    return res.status(200).json({
      message:
        "If an account with that email exists, we have sent a password reset link.",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (
      !resetRecord ||
      resetRecord.used ||
      resetRecord.expiresAt < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "This reset link is invalid or has expired." });
    }

    const hashedPassword = await generatePassword(password);

    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    next(err);
  }
};
