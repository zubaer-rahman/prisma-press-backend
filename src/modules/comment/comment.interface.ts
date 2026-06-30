import { CommentStatus } from "../../../generated/prisma/enums";

export interface ICreatePostPayload {
  postId?: string;
  content: string;
  status: CommentStatus;
}
