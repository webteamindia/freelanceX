import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("You are not authenticated");

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) return res.status(403).send("Invalid token");
    req.userId = payload?.userId;
    req.userEmail = payload?.email;
    next();
  });
};
