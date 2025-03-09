import { prisma } from "@/prisma/client";
//USER STORY: As a visitor, I want to browse and read blog posts 
//so that I can learn from others’ experiences and code examples. 
//I want to search through blog posts by their title, content, tags, 
//and also the code templates they contain.

export default async function handler(req, res) {
  if (req.method === 'GET') {

    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (page - 1) * limit;
    
        // Build a dynamic filter based on the search term
        const searchFilter = search ? {
          OR: [
            { title: { contains: search } }, // Search in titles
            { content: { contains: search } }, // Search in content
            {
              tags: {
                some: { name: { contains: search } } // Search in tags
              }
            }
          ]
        } : {}; // If no search, use an empty object
    
        // Count total posts for pagination (with or without search)
        const totalPosts = await prisma.blogPost.count({
          where: searchFilter
        });
    
        // Fetch posts with pagination and optional search filter
        const posts = await prisma.blogPost.findMany({
          where: searchFilter,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { created_at: 'desc' },
          include: {
            author: {
              select: { username: true }, // Include username in the response
            },
            tags: true, // Include tags in the response
            templates: true,
            comments: {
              include: {
                user: {
                  select: { username: true, avatar: true } // Include user details for comments
                },
                ratings: true, // Include ratings for each comment
                is_hidden: false
              }
            },
            ratings: true, // Include ratings for the blog post
            is_hidden: false
          },
        });
    
        // Calculate total pages for pagination
        const totalPages = Math.ceil(totalPosts / limit);
    
        // Send response with posts and pagination details
        res.status(200).json({
          posts,
          pagination: {
            totalPosts,
            totalPages,
            currentPage: parseInt(page),
            limit: parseInt(limit),
          },
        });
    } catch (error) {
      console.error("Error fetching public posts:", error);
      res.status(500).json({ error: "Error fetching public posts" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
