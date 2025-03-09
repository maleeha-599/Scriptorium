import { prisma } from "@/prisma/client";

export default async function handler(req, res) {
    const { id } = req.query;
    if (req.method === 'GET') {


        try {
            if (id) {
                const post = await prisma.blogPost.findUnique({
                    where: { id: id}, // Ensure `id` is a number
                    include: {
                        author: {
                            select: { username: true }, // Include author username
                        },
                        tags: true, // Include tags
                        templates: true, // Include templates
                        comments: {
                            include: {
                                user: {
                                    select: { username: true, avatar: true } // Include user details
                                },
                                ratings: true, // Include ratings for each comment
                            },
                            where: { is_hidden: false }, // Exclude hidden comments
                        },
                        ratings: true, // Include ratings for the blog post
                    },
                });

                if (!post) {
                    return res.status(404).json({ error: "Blog post not found" });
                }

                return res.status(200).json(post);
            } 
        } catch (error) {
            console.error("Error fetching public posts:", error);
            res.status(500).json({ error: "Error fetching public posts" });
        } 
    }else {
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
