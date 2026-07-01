import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";
const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("Error_", err);

  let statusCode;
  let errMessage = err.message || "Internal Server Error.";
  let errName = err.name || "Internal Server Error.";

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errMessage = "You've provided incorrect field type or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST;
      errMessage = "Duplicate Key Error";
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      errMessage = "Foreign key constraint failed";
    } else if (err.code === "2025") {
      statusCode = httpStatus.BAD_REQUEST;
      errMessage =
        "An operation failed because it depends on one or more records that were required but not found";
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED;
      errMessage =
        "Authentication failed against database server. Please check your credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.UNAUTHORIZED;
      errMessage = "Can't reach database server";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    errMessage = "Error occurred during query execution";
  }
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    statusCode: statusCode?? httpStatus.INTERNAL_SERVER_ERROR,
    name: errName,
    message: errMessage,
    error: err.stack,
  });
};
export default globalErrorHandler;
