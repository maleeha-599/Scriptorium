//Error checking done by chatgpt

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import bcrypt from 'bcryptjs';


export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { first_name, last_name, username, email, password, avatar, phone_number } = req.body;

        // General error checking
        if (!first_name || !last_name || !username || !email || !password || !phone_number) {
            return res.status(400).json({ error: 'All fields are required' });
        }


        if(!avatar || (avatar !== "/uploads/avatars/avatar1.png" && avatar !== "/uploads/avatars/avatar2.png" && avatar !== "/uploads/avatars/avatar3.png")){
            return res.status(400).json({ error: 'You must select an avatar' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const phoneRegex = /^[0-9]+$/; // Assuming phone number should only contain digits
        if (!phoneRegex.test(phone_number)) {
            return res.status(400).json({ error: 'Phone number must contain only digits' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const newUser = await prisma.user.create({
                data: {
                    first_name,
                    last_name,
                    username,
                    email,
                    password: hashedPassword,
                    avatar,
                    phone_number,
                },
            });

            const responseUser = {
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                username: newUser.username,
                email: newUser.email,
                avatar: newUser.avatar,
                phone_number: newUser.phone_number,
            };

            res.status(201).json({ message: 'User created successfully', user: responseUser });
        } catch (error) {
            console.error('Signup Error:', error); // This will log the error in your console
            if (error.code === 'P2002') {
                const duplicatedField = error.meta.target[0]; // Get duplicated field
                res.status(400).json({ error: `${duplicatedField} is already taken` });
            } else {
                res.status(500).json({ error: error.message || 'Error creating user' });
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }

}