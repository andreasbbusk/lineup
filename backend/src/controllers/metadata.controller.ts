import { Request, Response } from "express";

export const getMetadata = async (req: Request, res: Response) => {
  res.json({ message: "Get metadata" });
};
