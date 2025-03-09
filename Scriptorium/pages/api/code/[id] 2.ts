import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const snippet = await prisma.template.findUnique({
        where: { id: parseInt(id) },
        include: { user: true, tags: true },
      });

      if (!snippet) {
        return res.status(404).json({ error: 'Snippet not found' });
      }
      res.status(200).json(snippet);
    } catch (err) {
      console.error('Error fetching snippet:', err);
      res.status(500).json({ error: 'Error fetching snippet' });
    }
  } else if (req.method === 'PUT') {
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;

    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        userId = decodedToken.userId;
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }

    const { title, codeContent, language, stdin, tags } = req.body;

    try {
      const snippet = await prisma.template.findUnique({
        where: { id: parseInt(id) },
        select: { userId: true },
      });

      if (!snippet) {
        return res.status(404).json({ error: 'Snippet not found' });
      }

      if (snippet.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const updatedSnippet = await prisma.template.update({
        where: { id: parseInt(id) },
        data: {
          title: title || undefined,
          codeContent: codeContent || undefined,
          language: language || undefined,
          stdin: stdin || undefined,
          tags: {
            set: [], // Clear existing tags
            connectOrCreate: tags?.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          },
        },
      });

      res.status(200).json(updatedSnippet);
    } catch (err) {
      console.error('Error updating snippet:', err);
      res.status(500).json({ error: 'Error updating snippet' });
    }
  } else if (req.method === 'DELETE') {
    const token = req.headers.authorization?.split(' ')[1];
    let userId = null;

    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        userId = decodedToken.userId;
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }

    try {
      const snippet = await prisma.template.findUnique({
        where: { id: parseInt(id) },
        select: { userId: true },
      });

      if (!snippet) {
        return res.status(404).json({ error: 'Snippet not found' });
      }

      if (snippet.userId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await prisma.template.delete({
        where: { id: parseInt(id) },
      });

      res.status(200).json({ message: 'Snippet deleted successfully' });
    } catch (err) {
      console.error('Error deleting snippet:', err);
      res.status(500).json({ error: 'Error deleting snippet' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
