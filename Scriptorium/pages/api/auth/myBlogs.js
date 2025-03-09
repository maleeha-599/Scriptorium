import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../../../utils/jwt';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  const { userId } = decoded;

  try {
    const { page = 1, limit = 5, search = '' } = req.query;
    const skip = (page - 1) * limit;

    // Build a dynamic search filter based on the search term
    const searchFilter = search
      ? {
          AND: [
            { author_id: userId }, // Ensure only the authenticated user's posts are returned
            {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                {
                  tags: {
                    some: { name: { contains: search, mode: 'insensitive' } }
                  }
                }
              ]
            }
          ]
        }
      : { author_id: userId }; // If no search term, just filter by author

    // Count total posts for pagination (with or without search)
    const totalPosts = await prisma.blogPost.count({
      where: searchFilter
    });

    // Fetch posts with pagination and the search filter
    const posts = await prisma.blogPost.findMany({
      where: searchFilter,
      skip: parseInt(skip),
      take: parseInt(limit),
      orderBy: { created_at: 'desc' },
      include: {
        author: {
          select: { username: true, avatar: true }, // Include author details
        },
        tags: true, // Include tags
        templates: true,
        comments: {
          orderBy: { created_at: 'desc' }, // Sort comments by creation date
          include: {
            user: { select: { username: true, avatar: true } }, // Include user details for comments
            ratings: true,
          }
        },
        ratings: true, // Include ratings for the post
      }
    });

    // Calculate total pages for pagination
    const totalPages = Math.ceil(totalPosts / limit);

    // Send the response with posts and pagination details
    return res.status(200).json({
      posts,
      pagination: {
        totalPosts,
        currentPage: parseInt(page),
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
}
