import { Request, Response } from "express";

export const getPosts = async (req: Request, res: Response) => {
  res.json({ message: "Get posts" });
};
