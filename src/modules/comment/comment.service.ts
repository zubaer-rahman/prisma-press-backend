import { prisma } from "../../lib/prisma";
import { ICreatePostPayload } from "./comment.interface";

const createComment = async (authorId: string, payload: ICreatePostPayload) => {
  const createdPost = await prisma.comment.create({
    data: {
      ...payload,
      authorId,
    },
  });

  return createdPost;
};

export const commentService = {
  createComment,
};
