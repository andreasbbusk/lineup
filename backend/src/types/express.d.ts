import { Request } from "express";
import { UserProfile } from "./api.types.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        email: string;
      };
      profile?: UserProfile;
    }
  }
}
