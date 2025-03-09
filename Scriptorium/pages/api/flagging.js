import { prisma } from '@/prisma/client';
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { explanation, postId, commentId } = req.body;
    const getUserIdFromToken = (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.userId; // Ensure your token contains userId
      } catch (error) {
        return null; // Token is invalid
      }
    };
  
    const token = req.headers.authorization?.split(' ')[1]; // Bearer token
    const userId = getUserIdFromToken(token);
    
  
    
    if (!userId) {
      return res.status(401).json({ error: 'You must be signed in to report content' });
    }

    if (!postId && !commentId) {
      return res.status(400).json({ error: 'Must provide postId or commentId' });
    }

    try {
      const newReport = await prisma.report.create({
        data: {
          explanation,
          reporter: { connect: { id: userId } }, // Link to the reporter (user)
          post: postId ? { connect: { id: postId } } : undefined, // Connect to post if provided
          comment: commentId ? { connect: { id: commentId } } : undefined, // Connect to comment if provided
        },
      });
      console.log("hi")


      // Increment reportsCount on the reported post or comment
      if (postId) {
        await prisma.blogPost.update({
          where: { id: postId },
          data: { numOfReports: { increment: 1 } },
        });
      } else if (commentId) {
        await prisma.comment.update({
          where: { id: commentId },
          data: { numOfReports: { increment: 1 } },
        });
      }

      res.status(201).json(newReport);
    } catch (error) {
      console.error("Error reporting content:", error);
      res.status(500).json({ error: 'Error reporting content', });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}