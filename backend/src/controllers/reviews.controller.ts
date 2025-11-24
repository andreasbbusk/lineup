import { Request, Response } from "express";

export const getReviews = async (req: Request, res: Response) => {
  res.json({ message: "Get reviews" });
};
