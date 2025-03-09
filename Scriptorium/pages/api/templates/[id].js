// pages/api/templates/[id].js

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const template = await prisma.template.findUnique({
        where: { id },
        include: { tags: true, author: { select: { username: true } } },
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.status(200).json({
        id: template.id,
        title: template.title,
        description: template.description,
        code: template.code,
        language: template.language,
        tags: template.tags.map((tag) => tag.name) || [], // Ensure tags is always an array
        stdin: template.stdin,
        author: template.author.username,
      });
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({ error: 'Error fetching template' });
    }
  } else if (req.method === 'PUT') {
    try {
      // Authenticate the user
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.id;

      if (!userId) {
        return res.status(401).json({ error: 'Invalid token: user ID not found' });
      }

      // Find the existing template
      const existingTemplate = await prisma.template.findUnique({
        where: { id },
      });

      if (!existingTemplate) {
        return res.status(404).json({ error: 'Template not found' });
      }

      if (existingTemplate.author_id !== userId) {
        return res
          .status(403)
          .json({ error: 'You are not authorized to edit this template' });
      }

      const { title, description, code, tags, language, stdin } = req.body;

      // Validate that tags is an array
      if (!Array.isArray(tags)) {
        return res.status(400).json({ error: 'Tags must be an array of strings' });
      }

      // Update the template
      const updatedTemplate = await prisma.template.update({
        where: { id },
        data: {
          title: title.toLowerCase(), // Store title in lowercase
          description,
          code,
          language: language.toLowerCase(), // Ensure language is lowercase
          stdin: stdin || null,
          tags: {
            set: [], // Remove existing tags
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag.toLowerCase() },
              create: { name: tag.toLowerCase() },
            })),
          },
        },
        include: {
          tags: true,
          author: { select: { username: true } },
        },
      });

      res.status(200).json({
        id: updatedTemplate.id,
        title: updatedTemplate.title,
        description: updatedTemplate.description,
        code: updatedTemplate.code,
        language: updatedTemplate.language,
        tags: updatedTemplate.tags.map((tag) => tag.name) || [],
        stdin: updatedTemplate.stdin,
        author: updatedTemplate.author.username,
      });
    } catch (error) {
      console.error('Error updating template:', error);

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }

      res.status(500).json({ error: 'Error updating template' });
    }
  } else if (req.method === 'DELETE') {
    try {
      // Authenticate the user
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.id;

      if (!userId) {
        return res.status(401).json({ error: 'Invalid token: user ID not found' });
      }

      // Check if the template exists and belongs to the user
      const template = await prisma.template.findUnique({
        where: { id },
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      if (template.author_id !== userId) {
        return res
          .status(403)
          .json({ error: 'You are not authorized to delete this template' });
      }

      // Delete the template
      await prisma.template.delete({
        where: { id },
      });

      res.status(200).json({ message: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({ error: 'Error deleting template' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ error: 'Method not allowed' });
  }
}
