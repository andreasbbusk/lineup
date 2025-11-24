import { Request, Response } from "express";

export const getCollaborations = async (req: Request, res: Response) => {
  res.json({ message: "Get collaborations" });
};
