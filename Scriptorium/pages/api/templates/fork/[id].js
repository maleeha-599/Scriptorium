// pages/api/templates/fork/[id].js

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
export default async function handler(req, res) {
  const { id } = req.query; // Get the template ID from the query parameters

  if (req.method === 'POST') {
    if (!id) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    // Ensure the content type is JSON
    if (!req.headers['content-type']?.includes('application/json')) {
      return res.status(400).json({ error: 'Invalid content type, expected application/json' });
    }

    // Decode the authorId from JWT in the Authorization header
    let authorId = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decodedToken);
        authorId = decodedToken.userId || decodedToken.id;
        console.log('Author ID:', authorId);
      } catch (error) {
        console.error('Invalid or expired token:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    } else {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { code, stdin } = req.body;

    try {
      // Fetch the original template to duplicate, including tags
      const originalTemplate = await prisma.template.findUnique({
        where: { id: id },
        include: { tags: true },
      });

      if (!originalTemplate) {
        return res.status(404).json({ error: 'Original template not found' });
      }

      // Create the forked template
      const forkedTemplate = await prisma.template.create({
        data: {
          title: `${originalTemplate.title} (forked)`,
          code: code || originalTemplate.code,
          description: originalTemplate.description,
          language: originalTemplate.language,
          stdin: stdin || originalTemplate.stdin,
          forked: true, // Set the fork flag to true
          forkedId: originalTemplate.id, // Reference the original template ID
          author: { connect: { id: authorId } },
          tags: {
            connectOrCreate: originalTemplate.tags.map((tag) => ({
              where: { name: tag.name },
              create: { name: tag.name },
            })),
          },
        },
      });

      // Return the ID of the forked template
      res.status(201).json({ id: forkedTemplate.id });
    } catch (error) {
      console.error('Error creating forked template:', error);
      res.status(500).json({ error: 'Error creating forked template', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
