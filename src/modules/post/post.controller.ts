import httpStatus from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { postService } from "./post.service";
import { sendResponse } from "../../utils/sendResponse";

const createPost = catchAsync(async (req: Request, res: Response) => {
  const id = req.user?.id;
  const payload = req.body;

  const result = await postService.createPostIntoDB(id as string, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Post created successfully!",
    data: { result },
  });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const result = await postService.getAllPostFromDB();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Posts are fetched successfully",
    data: { result },
  });
});

const getPostById = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.postId;
  if (!postId) throw new Error("postId id required in params");

  const result = await postService.getPostById(postId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Post retrived successfully!",
    data: { result },
  });
});

const getMyPosts = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user?.id;
  const result = await postService.getAllMyPosts(authorId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My posts are retrieved successfully!",
    data: { result },
  });
});

const updatePostById = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const payload = req.body;
  const authorId = req.user?.id;
  const isAdmin = req.user?.role === "ADMIN";

  const result = await postService.updatePostById(
    postId as string,
    payload,
    authorId as string,
    isAdmin,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Post updated succesfully!",
    data: { result },
  });
});

const deletePostById = catchAsync(async (req: Request, res: Response) => {
  const postId = req.params.postId;
  const authorId = req.user?.id;
  const isAdmin = req.user?.role === "ADMIN";

  await postService.deletePostById(
    postId as string,
    authorId as string,
    isAdmin,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Post deleted successfully.",
    data: null,
  });
});

const getPostStats = catchAsync(async (req: Request, res: Response) => {
  const result = await postService.getPostStats();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Posts stats retrieved successfully.",
    data: { result },
  });
});
export const postController = {
  createPost,
  getAllPosts,
  getPostById,
  getMyPosts,
  updatePostById,
  deletePostById,
  getPostStats,
};
