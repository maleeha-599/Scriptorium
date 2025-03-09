import { prisma } from "@/prisma/client";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
          const blogPostsWithTemplates = await prisma.blogPost.findMany({
            where: {
              templates: {
                some: {}, // Filters for blog posts that have at least one template associated
              },
            },
            include: {
              templates: true, // Include the templates in the response
              author: true, // Optionally include the author information
              tags: true, // Optionally include the tags
            },
          });
      
          res.status(200).json(blogPostsWithTemplates);
        } catch (error) {
          console.error(error); // Log the error for debugging
          res.status(500).json({ error: 'Error fetching blog posts with templates.' });
        }
    } else {
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
      }
      
} 