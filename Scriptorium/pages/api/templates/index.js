// pages/api/templates/index.js

import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, description, code, tags, language, stdin } = req.body;

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided or invalid token format' });
    }
    const token = authHeader.split(' ')[1];

    try {
      // Verify token and extract user information
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Extract the user ID from the token (supporting both 'id' and 'userId')
      const authorId = decoded.userId || decoded.id;

      if (!authorId) {
        return res.status(401).json({ error: 'Invalid token: user ID not found' });
      }

      // Create the template with lowercase title, language, and tags
      const template = await prisma.template.create({
        data: {
          title: title.toLowerCase(), // Store title in lowercase
          code,
          description,
          language: language.toLowerCase(), // Ensure language is lowercase
          stdin: stdin || null,
          tags: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag.toLowerCase() },
              create: { name: tag.toLowerCase() },
            })),
          },
          author: {
            connect: { id: authorId },
          },
        },
        include: {
          tags: true,
          author: { select: { username: true } },
        },
      });
      res.status(201).json(template); // Changed status to 201 (Created)
    } catch (error) {
      console.error('Error creating template:', error);

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Invalid token' });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' });
      }

      res.status(500).json({ error: 'Error creating template' });
    }
  } else if (req.method === 'GET') {
    const { page = 1, limit = 10, search = "", id } = req.query;

    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skip = (currentPage - 1) * itemsPerPage;

    try {
      let templates = [];
      let totalTemplates = 0;

      if (search) {
        // Convert search term to lowercase
        const lowerSearch = search.toLowerCase();

        // Fetch templates where title or tags contain the search term
        templates = await prisma.template.findMany({
          where: {
            OR: [
              {
                title: {
                  contains: lowerSearch,
                },
              },
              {
                tags: {
                  some: {
                    name: {
                      contains: lowerSearch,
                    },
                  },
                },
              },
            ],
          },
          orderBy: {
            title: 'asc',
          },
          include: {
            author: { select: { username: true } },
            tags: true,
          },
          skip,
          take: itemsPerPage,
        });

        // Count total matching templates
        totalTemplates = await prisma.template.count({
          where: {
            OR: [
              {
                title: {
                  contains: lowerSearch,
                },
              },
              {
                tags: {
                  some: {
                    name: {
                      contains: lowerSearch,
                    },
                  },
                },
              },
            ],
          },
        });
      } else if (id) {
        // If 'id' is provided, fetch a single template by ID
        const parsedId = typeof id === 'string' ? id : id[0];
        const template = await prisma.template.findUnique({
          where: { id: parsedId },
          include: {
            author: { select: { username: true } },
            tags: true,
          },
        });

        if (!template) {
          return res.status(404).json({ error: 'Template not found' });
        }

        return res.status(200).json(template);
      } else {
        // No search term or ID provided, return all templates with pagination
        templates = await prisma.template.findMany({
          skip,
          take: itemsPerPage,
          orderBy: { created_at: 'desc' },
          include: {
            author: { select: { username: true } },
            tags: true,
          },
        });

        // Count total templates
        totalTemplates = await prisma.template.count();
      }

      res.status(200).json({
        templates,
        pagination: {
          totalTemplates,
          totalPages: Math.ceil(totalTemplates / itemsPerPage),
          currentPage,
          itemsPerPage,
        },
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Error fetching templates' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
