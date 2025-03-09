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
    return res.status(401).json({ error: 'You must be signed in to edit or delete a template.' });
  }
  const { id } = req.query; // Get the template ID from the query parameters


  if (req.method === 'POST') {
    const { title, code, description, tags } = req.body;
    console.log({title, code, description, tags})

    try {
        console.log(id)
        // Check if the original template exists
        const originalTemplate = await prisma.template.findUnique({ where: { id } });
        if (!originalTemplate) {
            return res.status(404).json({ message: 'Template not found' });
        }
        console.log(originalTemplate)

        // Create the forked template
        const forkedTemplate = await prisma.template.create({
            data: {
                title,
                code,
                description,
                author: { connect: { id: userId } },
                tags: {
                    connectOrCreate: tags.map((tag) => ({
                        where: { name: tag }, // Assuming tags are identified by name
                        create: { name: tag }, // Create a new tag if it doesn't exist
                    })),
                },
            },
        });
        console.log("hi")

        return res.status(201).json({
            message: 'Template forked successfully',
            template: forkedTemplate
        });
        } catch (error) {
        return res.status(500).json({ message: 'Error forking template', error });
        }
  } else if (req.method === 'PUT') {
    // Update the template
    const { title, description, code, tags } = req.body;

    try {
        const updatedTemplate = await prisma.template.update({
        where: {
          id: id,
          author_id: userId, // Ensure the template belongs to the authenticated user
        },
        data: {
          title,
          description,
          code,
          tags: {
            // Handle tags update (assumes you have a relation to a Tag model)
            set: tags.map(tag => ({ name: tag })),
          },
        },
      });

      res.status(200).json(updatedTemplate);
    } catch (error) {
      console.error('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template. You can only update your own template' });
    }
  } else if (req.method === 'DELETE') {
    // Delete the template
    try {

      await prisma.template.delete({
        where: {
          id: id,
          author_id: userId, // Ensure the template belongs to the authenticated user
        },
      });

      res.status(204).json({ message: 'Template deleted successfully.' });
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template. You can only delete your own template' });
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
