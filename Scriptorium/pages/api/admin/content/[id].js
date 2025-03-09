import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  console.log(id);

  if (req.method === 'PATCH') {
    try {
      // Check if the post exists and has been reported
      const blogPost = await prisma.blogPost.findUnique({
        where: { id },
        include: {
          reports: true,
        },
      });
      const comPost = await prisma.comment.findUnique({
        where: { id },
        include: {
          reports: true,
        },
      });
      console.log(comPost)

      console.log(comPost); // Check if you get the correct comment data
      if (!blogPost && !comPost) {
        return res.status(404).json({ error: 'Post or comment not found' });
      }

      // Check if the blog post has reports
      if (blogPost && blogPost.reports.length === 0) {
        return res.status(400).json({ error: 'This post has no reports' });
      }

      // Check if the comment has reports
      if (comPost && comPost.reports.length === 0) {
        return res.status(400).json({ error: 'This comment has no reports' });
      }

      let updatedPost;

      // If it's a blog post
      if (blogPost) {
        updatedPost = await prisma.blogPost.update({
          where: { id },
          data: {
            is_hidden: true,
          },
        });
      }

      // If it's a comment post
      if (comPost) {
        console.log("Updating comment to hidden");
        updatedPost = await prisma.comment.update({
          where: { id },
          data: {
            is_hidden: true,
          },
        });
      }

      console.log(updatedPost); // Check what data is being returned

      return res.status(200).json({
        message: 'Post successfully hidden',
        post: updatedPost,
      });
    } catch (error) {
      console.error('Failed to hide post:', error);
      return res.status(500).json({ error: 'Failed to hide post' });
    }
  } else {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
