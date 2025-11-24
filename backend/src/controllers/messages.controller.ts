import { Request, Response } from "express";

export const getMessages = async (req: Request, res: Response) => {
  res.json({ message: "Get messages" });
};
