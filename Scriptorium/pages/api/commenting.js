import { prisma } from '@/prisma/client';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  const getUserIdFromToken = (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.userId; // Ensure your token contains userId
    } catch (error) {
      return null; // Token is invalid
    }
  };
  

  const token = req.headers.authorization?.split(' ')[1]; // Bearer token
  console.log(token)
  const userId = getUserIdFromToken(token);
  

  if (req.method === 'POST') {
      const { blog_post_id, content, parent_id } = req.body; // Removed user_id from here
      console.log({blog_post_id, content})
      console.log({userId})
      // Check if the user is authenticated
      if (!userId) {
        return res.status(401).json({ error: 'You must be signed in to comment' });
      }
      console.log({userId})

      try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
          return res.status(404).json({ error: 'User not found.' });
        }
    
        if (!content || !blog_post_id) { // Removed user_id from here as it's not needed
          return res.status(400).json({ error: "Missing required fields" });
        }
        //console.log("Type of blog_post_id:", typeof blog_post_id)

        const blogPost1 = await prisma.blogPost.findUnique({
          where: { id: blog_post_id },
        });

        if (!blogPost1) {
          return res.status(404).json({ error: "Blog post not found." });
        }

        const newComment = await prisma.comment.create({
            data: {
                blog_post: { connect: { id: blog_post_id } }, // Correctly connecting to the blog post
                user: { connect: { id: userId } } , // Correctly connecting to the user
                content,
                ...(parent_id && { parent: { connect: { id: parent_id } } })
            },
            include: {
              user: true, // Include the user object in the response
            },
        });

        res.status(201).json(newComment);
      } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ error: "Failed to create comment." });
      }
  } else if (req.method === 'GET') {
    const { blog_post_id, page = 1, limit = 10, parent_id = null } = req.query;
    const skip = (page - 1) * limit;

    try {
      if (!blog_post_id) {
        return res.status(400).json({ error: "Blog post ID is required." });
      }

      // Verify the blog post exists
      const blogPost = await prisma.blogPost.findUnique({
        where: { id: blog_post_id },
      });

      if (!blogPost) {
        return res.status(404).json({ error: "Blog post not found." });
      }

      // Fetch comments with optional parent filtering and pagination
      const comments = await prisma.comment.findMany({
        where: {
            blog_post_id,
            parent_id: parent_id || null, // Filter by parent_id if provided
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
            user: {
                select: { username: true, avatar: true }, // Include user details
            },
            ratings: true,  // Include ratings for comments
            replies: {     // Include replies recursively
                include: {
                    user: {
                        select: { username: true, avatar: true },
                    },
                    ratings: true,
                    replies: {     // Include replies recursively
                      include: {
                          user: {
                              select: { username: true, avatar: true },
                          },
                          ratings: true,
                          replies: {     // Include replies recursively
                            include: {
                                user: {
                                    select: { username: true, avatar: true },
                                },
                                ratings: true,
                                replies: {     // Include replies recursively
                                  include: {
                                      user: {
                                          select: { username: true, avatar: true },
                                      },
                                      ratings: true,
                                      replies: {     // Include replies recursively
                                        include: {
                                            user: {
                                                select: { username: true, avatar: true },
                                            },
                                            ratings: true,
                                        },
                                    },
                                  },
                              },
                            },
                        },
                      },
                  },
                },
            },
        },
    });

      // Count total comments for pagination
      const totalComments = await prisma.comment.count({
        where: {
          blog_post_id,
          parent_id: parent_id || null,
        },
      });

      // Calculate total pages for pagination
      const totalPages = Math.ceil(totalComments / limit);

      // Respond with comments and pagination info
      res.status(200).json({
        comments,
        pagination: {
          totalComments,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Error fetching comments." });
    }
  }else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
