import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { commentService } from "./comment.service";
import { sendResponse } from "../../utils/sendResponse";

const createComment = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user?.id;
  const payload = req.body;

  const result = await commentService.createComment(
    authorId as string,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Comment created successfully.",
    data: { result },
  });
});

export const commentController = {
  createComment,
};
