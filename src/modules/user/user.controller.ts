import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { userService } from "./user.service";
import catchAsync from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
const registerUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    console.log({ payload });
    const user = await userService.registerUserIntoDB(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User registered successfully!",
      data: {
        user,
      },
    });
  },
);
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { accessToken } = req.cookies;

  const verifiedToken = jwtUtils.verifyToken(
    accessToken,
    config.jwt_acess_secret,
  );
  if (typeof verifiedToken === "string") {
    throw new Error(verifiedToken);
  }
  const profile = await userService.getMyProfileFromDB(verifiedToken.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Profile fetched successfully",
    data: { profile },
  });
});

export const userController = {
  registerUser,
  getMyProfile,
};
