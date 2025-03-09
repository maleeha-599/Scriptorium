// pages/api/templates/mine.js
import { prisma } from "@/prisma/client";
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const templates = await prisma.template.findMany({
      where: { author_id: userId },
      include: {
        tags: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    res.status(200).json({ templates });
  } catch (error) {
    console.error("Error fetching user's templates:", error);
    res.status(401).json({ error: "Invalid token" });
  }
}
