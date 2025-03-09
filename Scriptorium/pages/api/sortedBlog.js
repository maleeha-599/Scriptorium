// /pages/api/posts.js

import { prisma } from "@/prisma/client";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const skip = (page - 1) * limit;

      // Build a dynamic filter based on the search term
      const searchFilter = search ? {
        OR: [
          { title: { contains: search } },
          { content: { contains: search } },
          { tags: { some: { name: { contains: search } } } }
        ]
      } : {};

      // Fetch blog posts with pagination, sorting by upvotes, and nested comments sorted by upvotes
      const posts = await prisma.blogPost.findMany({
        where: {
          ...searchFilter,
          is_hidden: false, // Add this line to filter out hidden posts
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { numOfUpvotes: 'desc' }, // Sort posts by upvotes, highest first
        include: {
          author: { select: { username: true } },
          tags: true,
          comments: {
            orderBy: { numOfUpvotes: 'desc' }, // Sort comments by upvotes within each post
            include: {
              user: { select: { username: true, avatar: true } },
              ratings: true,
              is_hidden: false // Optional: exclude hidden comments if needed
            }
          },
          ratings: true,
          reports:true,
        },
      });

      // Count total posts for pagination
      const totalPosts = await prisma.blogPost.count({ where: searchFilter });
      const totalPages = Math.ceil(totalPosts / limit);

      res.status(200).json({
        posts,
        pagination: {
          totalPosts,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Error fetching sorted posts and comments:", error);
      res.status(500).json({ error: "Error fetching posts and comments" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
