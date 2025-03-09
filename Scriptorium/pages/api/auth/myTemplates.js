import { prisma } from '@/prisma/client';
import { verifyToken } from '@/utils/jwt'; // Assumes a helper for JWT verification

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Verify the user's JWT token
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided.' });
      }

      const decoded = verifyToken(token); // Decodes and verifies JWT
      if (!decoded || !decoded.id) {
        return res.status(403).json({ error: 'Unauthorized: Invalid token.' });
      }

      const userId = decoded.id;

      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const skip = (page - 1) * limit;

      // Fetch templates owned by the user, sorted by date (newest first)
      const templates = await prisma.template.findMany({
        where: { ownerId: userId },
        orderBy: { createdAt: 'desc' }, // Sort by creation date, newest first
        skip,
        take: limit,
        include: {
          tags: true, // Include associated tags if applicable
        },
      });

      // Count total templates owned by the user
      const totalTemplates = await prisma.template.count({
        where: { ownerId: userId },
      });

      // Respond with templates and pagination metadata
      res.status(200).json({
        templates,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalTemplates / limit),
          totalTemplates,
        },
      });
    } catch (error) {
      console.error('Error fetching user templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
