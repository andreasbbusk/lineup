import { Request, Response } from "express";

export const getFeed = async (req: Request, res: Response) => {
  res.json({ message: "Get feed" });
};
