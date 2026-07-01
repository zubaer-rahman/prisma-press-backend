import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
  ICreatePostPayload,
  IPostQuery,
  IUpdatePostPayload,
} from "./post.interface";

const createPostIntoDB = async (
  authorId: string,
  payload: ICreatePostPayload,
) => {
  const createdPost = await prisma.post.create({
    data: {
      ...payload,
      authorId,
    },
  });

  return createdPost;
};
const getAllPostFromDB = async (query: IPostQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const tags = query.tags ? JSON.parse(query.tags as string) : null;
  const tagsArray = Array.isArray(tags) ? tags : [];

  const andConditions: PostWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }
  if (query.title) andConditions.push({ title: query.title });
  if (query.content) andConditions.push({ content: query.content });
  if (query.isFeatured)
    andConditions.push({ isFeatured: Boolean(query.isFeatured) });
  if (query.tags)
    andConditions.push({
      tags: {
        hasSome: tagsArray,
      },
    });

  const posts = await prisma.post.findMany({
    where: {
      AND: andConditions,
    },
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      comments: true,
    },
  });
  return posts;
};

const getPostById = async (id: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    const updatedPost = await tx.post.findUniqueOrThrow({
      where: { id },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comments: {
          where: {
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    return updatedPost;
  });

  return transactionResult;
};

const getAllMyPosts = async (authorId: string) => {
  const posts = await prisma.post.findMany({
    where: { authorId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      comments: true,
      author: {
        omit: {
          password: true,
        },
      },
      _count: {
        select: {
          comments: true,
        },
      },
    },
  });
  return posts;
};

const updatePostById = async (
  id: string,
  payload: IUpdatePostPayload,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id },
  });

  if (!isAdmin && authorId != post.authorId)
    throw new Error("You're not owner of this post!");

  const updatedPost = await prisma.post.update({
    where: { id },
    data: payload,
    include: {
      comments: true,
      author: {
        omit: {
          password: true,
        },
      },
    },
  });

  return updatedPost;
};

const deletePostById = async (
  id: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id },
  });

  if (!isAdmin && authorId !== post.authorId)
    throw new Error("You'are not owner of this post");

  await prisma.post.delete({
    where: { id },
  });
  return null;
};

const getPostStats = async () => {
  const stats = await prisma.$transaction(async (tx) => {
    const [
      totalPosts,
      totalPublishedPosts,
      totalDraftPosts,
      totalArchivedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViews,
    ] = await Promise.all([
      tx.post.count(),
      tx.post.count({
        where: {
          status: PostStatus.PUBLISHED,
        },
      }),
      tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),
      tx.post.count({
        where: {
          status: PostStatus.ARCHIVED,
        },
      }),
      tx.comment.count(),
      tx.comment.count({
        where: {
          status: CommentStatus.APPROVED,
        },
      }),
      tx.comment.count({
        where: {
          status: CommentStatus.REJECT,
        },
      }),

      tx.post.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);
    return {
      totalPosts,
      totalPublishedPosts,
      totalDraftPosts,
      totalArchivedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViews: totalPostViews._sum.views,
    };
  });
  return stats;
};

export const postService = {
  createPostIntoDB,
  getAllPostFromDB,
  getPostById,
  getAllMyPosts,
  updatePostById,
  deletePostById,
  getPostStats,
};
