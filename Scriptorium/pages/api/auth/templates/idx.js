import { prisma } from '@/prisma/client';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
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
    return res.status(401).json({ error: 'You must be signed in to create a template.' });
  }

  if (req.method === 'POST') {
    const { title, code, description, tags } = req.body;

    // Check if the user is authenticated
    

    // Validate request body
    if (!title || !code || !description || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // Create the template
      const newTemplate = await prisma.template.create({
        data: {
          title,
          code,
          description,
          author: {
            connect: {
              id: userId, // Connect the template to the authenticated user
            },
          },
          tags: {
            connectOrCreate: tags.map((tag) => ({
              where: { name: tag }, // Assuming tags are identified by name
              create: { name: tag }, // Create a new tag if it doesn't exist
            })),
          },
        },
      });

      res.status(201).json(newTemplate);
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template.' });
    }
  } else if(req.method==='GET'){
    const { search } = req.query; // Extract search query

    try {
      const templates = await prisma.template.findMany({
        where: {
          author_id: userId, // Filter by the authenticated user's ID
          ...(search && {
            OR: [
              { title: { contains: search} }, // Search by title
              { description: { contains: search} }, // Search by description
              { tags: { some: { name: { contains: search} } } }, // Search by tags
            ],
          }),
        },
        include: {
          tags: true, // Include tags in the response
        },
      });

      res.status(200).json(templates);
    } catch (error) {
      console.error('Error retrieving templates:', error);
      res.status(500).json({ error: 'Failed to retrieve templates.' });
    }
  }  else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
