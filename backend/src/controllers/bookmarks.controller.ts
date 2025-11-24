import { Request, Response } from "express";

export const getBookmarks = async (req: Request, res: Response) => {
  res.json({ message: "Get bookmarks" });
};
