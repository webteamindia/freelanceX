import jwt from "jsonwebtoken";
import crypto from "crypto";
import pkg from "@prisma/client";
const { Prisma } = pkg;
import prisma from "../prisma/client.js";
import { loginUser, registerUser, generatePassword } from "../services/authService.js";
import { sendMail } from "../utils/mailer.js";
import { isValidPaypalEmail } from "../utils/payments.js";
import {
  createAndSendVerificationEmail,
  verifyEmailToken,
  requireEmailVerificationEnabled,
} from "../services/emailVerificationService.js";

const maxAge = 3 * 24 * 60 * 60;

const generateToken = (email, userId) => {
  return jwt.sign({ email, userId: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await registerUser({ email, password });

    let verificationSent = false;
    try {
      await createAndSendVerificationEmail(user);
      verificationSent = true;
    } catch (mailErr) {
      console.warn("[auth] verification email failed:", mailErr.message);
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        emailVerified: false,
      },
      jwt: generateToken(email, user.id),
      verificationSent,
      message: verificationSent
        ? "Account created. Check your email to verify your address."
        : "Account created.",
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser({ email, password });

    if (requireEmailVerificationEnabled() && !user.emailVerified) {
      return res.status(403).json({
        message: "Please verify your email before signing in.",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
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
    let user = await prisma.user.findUnique({
      where: { id: req.userId },
    });
    // Fallback for tokens where userId cannot be resolved but email exists.
    if (!user && req.userEmail) {
      user = await prisma.user.findUnique({
        where: { email: req.userEmail },
      });
    }
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
    if (req?.userId || req?.userEmail) {
      let currentUser = null;
      if (req.userId) {
        currentUser = await prisma.user.findUnique({
          where: { id: req.userId },
        });
      }
      if (!currentUser && req.userEmail) {
        currentUser = await prisma.user.findUnique({
          where: { email: req.userEmail },
        });
      }
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const { userName, fullName, description } = req.body;
      if (userName && fullName && description) {
        // Check if username is used by a different user
        const userNameValid = await prisma.user.findFirst({
          where: {
            username: userName,
            NOT: { id: currentUser.id },
          },
        });
        if (userNameValid) {
          return res.status(200).json({ userNameError: true });
        }

        await prisma.user.update({
          where: { id: currentUser.id },
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

export const oauthGoogle = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const baseUsername =
        (email.split("@")[0] || "user").replace(/[^a-zA-Z0-9]/g, "") || "user";
      let usernameCandidate = `${baseUsername}ff`;
      let suffix = 1;

      // Ensure username uniqueness
      while (
        await prisma.user.findFirst({ where: { username: usernameCandidate } })
      ) {
        usernameCandidate = `${baseUsername}ff${suffix}`;
        suffix += 1;
      }

      const generatedPassword = await generatePassword(
        crypto.randomBytes(24).toString("hex")
      );

      user = await prisma.user.create({
        data: {
          email,
          password: generatedPassword,
          username: usernameCandidate,
          fullName: name || null,
          isProfileInfoSet: !!name,
          emailVerified: true,
        },
      });
    } else if (!user.emailVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Your account is deactivated." });
    }

    return res.status(200).json({
      user: { id: user.id, email: user.email },
      jwt: generateToken(user.email, user.id),
      message: "Google auth successful",
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const token = req.query.token || req.body?.token;
    const result = await verifyEmailToken(token);

    if (!result.ok) {
      return res.status(400).json({ message: result.error });
    }

    return res.status(200).json({
      message: "Email verified successfully. You can sign in now.",
      email: result.email,
    });
  } catch (err) {
    next(err);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.emailVerified) {
      return res.status(200).json({ message: "Email is already verified." });
    }

    await createAndSendVerificationEmail(user);
    return res.status(200).json({ message: "Verification email sent." });
  } catch (err) {
    next(err);
  }
};

export const setNotificationPreferences = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { notifyOrderEmails, notifyMessageEmails } = req.body;
    const data = {};

    if (typeof notifyOrderEmails === "boolean") {
      data.notifyOrderEmails = notifyOrderEmails;
    }
    if (typeof notifyMessageEmails === "boolean") {
      data.notifyMessageEmails = notifyMessageEmails;
    }

    if (!Object.keys(data).length) {
      return res.status(400).json({
        message: "Provide notifyOrderEmails and/or notifyMessageEmails booleans.",
      });
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        notifyOrderEmails: true,
        notifyMessageEmails: true,
      },
    });

    return res.status(200).json({
      message: "Notification preferences saved.",
      preferences: user,
    });
  } catch (err) {
    next(err);
  }
};

export const setPaypalEmail = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { paypalEmail } = req.body;
    if (!isValidPaypalEmail(paypalEmail)) {
      return res.status(400).json({
        message: "A valid PayPal email address is required.",
      });
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { paypalEmail: paypalEmail.trim().toLowerCase() },
      select: {
        id: true,
        email: true,
        paypalEmail: true,
      },
    });

    return res.status(200).json({
      message: "PayPal payout email saved.",
      user,
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        gigs: {
          include: {
            reviews: true,
          }
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Seller not found" });
    }

    const { password, isAdmin, passwordResets, ...publicInfo } = user;
    return res.status(200).json({ profile: publicInfo });
  } catch (err) {
    next(err);
  }
};
