import { Request, Response } from "express";

export const getComments = async (req: Request, res: Response) => {
  res.json({ message: "Get comments" });
};
