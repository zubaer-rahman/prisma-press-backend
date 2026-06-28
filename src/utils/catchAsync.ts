import httpStatus from "http-status";
import { Request, Response, RequestHandler, NextFunction } from "express";

const catchAsync = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      console.log(error);

      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Internal Server Error!",
        error: (error as Error).message,
      });
    }
  };
};

export default catchAsync;
