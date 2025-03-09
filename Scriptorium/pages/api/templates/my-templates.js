// pages/api/templates/my-templates.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];

    try {
      // Verify token and extract user information
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.id;

      if (!userId) {
        return res.status(401).json({ error: 'Invalid token: user ID not found' });
      }

      // Fetch user's templates
      const templates = await prisma.template.findMany({
        where: {
          author_id: userId,
        },
        include: {
          tags: true,
        },
      });

      res.status(200).json({ templates });
    } catch (error) {
      console.error('Error fetching user templates:', error);
      res.status(500).json({ error: 'Error fetching user templates' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
