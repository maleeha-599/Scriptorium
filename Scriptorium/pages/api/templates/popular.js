import { prisma } from '@/prisma/client';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { limit = 10, page = 1, tag = "" } = req.query;
    const skip = (page - 1) * limit;

    try {
      const filterByTag = tag
        ? {
            tags: {
              some: { name: { contains: tag, mode: "insensitive" } },
            },
          }
        : {};

      // Fetch total count for pagination
      const totalTemplates = await prisma.template.count({ where: filterByTag });

      // Fetch templates based on popularity, tag filter, and pagination
      const templates = await prisma.template.findMany({
        where: filterByTag,
        orderBy: {
          numOfViews: 'desc', // Sort by popularity
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          tags: true,
          author: { select: { username: true } }, // Include author username
        },
      });

      res.status(200).json({
        templates,
        pagination: {
          totalTemplates,
          totalPages: Math.ceil(totalTemplates / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Error fetching popular templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
