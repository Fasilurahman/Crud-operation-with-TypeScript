import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      file?: {
        filename: string; // Modify based on your application's multer setup
        path?: string;
        mimetype?: string;
        size?: number;
      };
    }
  }
}

// In a separate file (e.g., types/express.d.ts)
import { IUser } from "../models/userModel"; // Import IUser

declare module "express-session" {
    interface SessionData {
        user_id?: string; // Or use `string` if you always expect it to be a string
    }
}

