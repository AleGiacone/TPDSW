import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SECRET_JWT_KEY } from "./config.js";

async function authToken(req: Request, res: Response) {
  const decodedToken = jwt.decode(req.cookies.access_token || '', { complete: true });
  if (!decodedToken) {
    res.status(401).json({ message: "Invalid token" });
    return false;
  }
  const token = jwt.verify(req.cookies.access_token, SECRET_JWT_KEY);
  if (!token) {
    res.status(401).json({ message: "Invalid token" });
    return false;
  }
  return token;
}

export { authToken };