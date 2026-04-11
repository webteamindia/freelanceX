import prisma from "../prisma/client.js";

export const verifyAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { isAdmin: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (err) {
    next(err);
  }
};

