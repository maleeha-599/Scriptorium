// ChatGPT used for allowing for user to input username or email as well as making admin token not expire

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../../../utils/jwt';

const prisma = new PrismaClient();

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { identifier, password } = req.body;

        try {
            // Checking if in email format
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

            // Find user
            const user = await prisma.user.findUnique({
                where: isEmail ? { email: identifier } : { username: identifier },
            });

            // Validate
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ error: "Invalid credentials" });
            }

            // Generate token based on user role
            const token = generateToken(user.id, user.is_admin); // Pass is_admin to the token generator
            res.status(200).json({ token });
        } catch (error) {
            res.status(500).json({ error: "Login failed" });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
