import { Request, Response } from "express";

export const getConnections = async (req: Request, res: Response) => {
  res.json({ message: "Get connections" });
};
