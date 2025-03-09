// pages/api/admin.js

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const getUserIdFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId; 
  } catch (error) {
    return null; 
  }
};

export default async function handler(req, res) {
  const token = req.headers.authorization?.split(' ')[1];
  const userId = getUserIdFromToken(token);

  if (!userId) {
    return res.status(401).json({ error: 'You must be signed in' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user || !user.is_admin) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(500).json({ error: 'Could not verify admin status' });
  }

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        // Fetch and sort blog posts and comments by report count
        const blogPosts = await prisma.blogPost.findMany({
          orderBy: { numOfReports: 'desc' },
          include: {
            comments: true,
            reports: {
              include: {
                reporter: true, 
              }
            }
          }
        });

        const comments = await prisma.comment.findMany({
          orderBy: { numOfReports: 'desc' },
          include: {
            reports: {
              include: {
                reporter: true, 
              }
            }
          }
        });

        return res.status(200).json({ blogPosts, comments });
      } catch (error) {
        console.error('Error fetching content:', error);
        return res.status(500).json({ error: 'Error fetching and sorting content.' });
      }

      case 'PUT':
        try {
          const contentId = parseInt(req.body.contentId);
          const { hidden, contentType } = req.body;
      
          // Input validation
          if (isNaN(contentId) || contentId < 1 || !['blogPost', 'comment'].includes(contentType)) {
            return res.status(400).json({ error: 'Invalid request data' });
          }
      
          // Update the specified content based on type
          if (contentType === 'blogPost') {
            await prisma.blogPost.update({
              where: { id: contentId },
              data: { is_hidden: hidden },
            });
          } else if (contentType === 'comment') {
            await prisma.comment.update({
              where: { id: contentId },
              data: { is_hidden: hidden },
            });
          }
      
          return res.status(200).json({ message: 'Content updated successfully' });
        } catch (error) {
          console.error('Error updating content:', error);
          return res.status(500).json({ error: 'Failed to update content' });
        }
      

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
