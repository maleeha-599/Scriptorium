  // pages/api/templates/index.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title, description, code, tags, language } = req.body;

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];

    try {
      // Verify token and extract user information
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log('Decoded token:', decoded);

      // Extract the user ID from the token
      const authorId = decoded.id;

      if (!authorId) {
        return res.status(401).json({ error: 'Invalid token: user ID not found' });
      }

      // Create the template
      const template = await prisma.template.create({
        data: {
          title: title.toLowerCase(), // Store title in lowercase
          code,
          description,
          language,
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
      res.status(200).json(template);
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Error creating template' });
    }
  } else if (req.method === 'GET') {
    try {
      if (keyword) {
          // Search for snippets containing the keyword in title or codeContent
          const snippets = await prisma.template.findMany({
              where: {
                  OR: [
                      { title: { contains: keyword} },
                      { codeContent: { contains: keyword} }
                  ]
              },
              include: {
                  user: true,
                  tags: true,
              },
          });
          return res.status(200).json(snippets);
      }

      // Fetch single snippet if id is provided
      if (id) {
          const snippet = await prisma.template.findUnique({
              where: { id: parseInt(id) },
              include: {
                  user: true,
                  tags: true,
              },
          });
          if (!snippet) {
              return res.status(404).json({ error: 'Snippet not found' });
          }
          return res.status(200).json(snippet);
      }

      // If no id or keyword is provided, return all snippets or handle as necessary
      const allSnippets = await prisma.template.findMany({
          include: {
              user: true,
              tags: true,
          },
      });
      return res.status(200).json(allSnippets);
  } catch (error) {
      console.log(error)
      return res.status(500).json({ error: 'Error fetching snippets' });
  }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
