import { prisma } from "@/prisma/client";
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
    // Check if the user is authenticated
    if (!userId) {
        return res.status(401).json({ error: 'You must be signed in to create a blog post.' });
    }
    const { id } = req.query;

    if (req.method === 'PUT') {
        const {title, description, tags, templateIds } = req.body;
        const post = await prisma.blogPost.findUnique({ where: { id: id } }); 
        if (post.is_hidden) {
            return res.status(403).json({ message: 'Post is hidden' }); 
        }

        try {
        const updatedPost = await prisma.blogPost.update({
            where: { id: id },
            data: {
                title,
                description,
                tags: {
                    disconnect: post.tags,
                    connectOrCreate: tags.map(tag => ({
                    where: { name: tag },
                    create: { name: tag },
                    })),
                },
                templates: {
                    set: templateIds?.map(templateId => ({ id: templateId })) || [], // Replace existing templates with new ones
                },
            },
            include: { // Optionally include tags and templates in the response
                tags: true,
                templates: true,
            },
        });
        res.status(200).json(updatedPost);
        } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: "Error updating blog post." });
        }
    } else if (req.method === 'DELETE') {
        try {
        const postToDelete = await prisma.blogPost.findUnique({ where: { id: id } });
        if (!postToDelete) {
            return res.status(404).json({ error: 'Post not found.' });
        }

        await prisma.blogPost.delete({ where: { id: id } });
        res.status(200).json({ message: `${postToDelete.title} has been deleted.` });
        } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: "Error deleting blog post." });
        }
    } else {
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} not allowed`);
    }
}
