import httpStatus from "http-status";
import { Request, Response } from "express";

const notFound = (req: Request, res: Response) => {
  res.status(httpStatus.NOT_FOUND).json({
    message: "Route not found.",
    path: req.originalUrl,
    date: Date(),
  });
};

export default notFound;
