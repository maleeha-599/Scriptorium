import { prisma } from "@/prisma/client";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { page = 1, pageSize = 10 } = req.query;

      // Convert page and pageSize to numbers for safe calculations
      const pageNumber = parseInt(page, 10);
      const pageSizeNumber = parseInt(pageSize, 10);

      // Input validation: Ensure page and pageSize are positive integers
      if (isNaN(pageNumber) || pageNumber < 1 || isNaN(pageSizeNumber) || pageSizeNumber < 1) {
        return res.status(400).json({ error: 'Invalid page or pageSize parameters' });
      }

      const skip = (pageNumber - 1) * pageSizeNumber;

      // Fetch reported posts with pagination
      const reports = await prisma.report.findMany({
        where: {
          postId: {
            not: null, // Ensure we are only fetching reports linked to posts
          },
        },
        include: {
          post: true, // Include the reported post details
          comment:true,
          reporter: {
            select: {
              id: true,
              first_name: true, // Fetch reporter's first name
              last_name: true,  // Fetch reporter's last name
            },
          },
        },
        skip,
        take: pageSizeNumber,
      });

      // Respond with the paginated reports
      res.status(200).json(reports);
    } catch (error) {
      console.error('Error fetching reported posts:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
