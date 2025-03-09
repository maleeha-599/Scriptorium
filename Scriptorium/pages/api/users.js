// Chatgpt used in combination with my code to develop users.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export default async function handler(req, res) {
  const { method } = req;

  const authenticateJWT = (req) => {
    
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      return null;
    }
  };

  switch (method) {
    case 'GET':
      try {
        const users = await prisma.user.findMany();
        res.status(200).json(users);
      } catch (error) {
        console.error('Error creating user:', error); 
        res.status(500).json({ error: 'Error fetching users.' });
      }
      break;

    case 'POST':
      const { first_name, last_name, username, email, password, phone_number, avatar } = req.body;
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const isAdmin = (
          username === ADMIN_USERNAME || 
          email == ADMIN_EMAIL
        );

        const newUser = await prisma.user.create({
          data: {
            first_name,
            last_name,
            username,
            email,
            password: hashedPassword, 
            phone_number,
            avatar,
            is_admin: isAdmin, 
          },
        });
        res.status(201).json(newUser);
      } catch (error) {
        console.error('Error creating user:', error); 
        res.status(500).json({ error: 'User could not be created.' });
      }
      break;

    case 'PUT':
      const userData = authenticateJWT(req);
      if (!userData) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id, ...updateData } = req.body;

      try {
        const updatedUser = await prisma.user.update({
          where: { id: userData.id },
          data: updateData,
        });
        res.status(200).json(updatedUser);
      } catch (error) {
        res.status(500).json({ error: 'User could not be updated.' });
      }
      break;

    case 'DELETE':
      const userToDelete = authenticateJWT(req);
      if (!userToDelete) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
        await prisma.blogPost.deleteMany({ where: { authorId: userToDelete.id } });
        await prisma.comment.deleteMany({ where: { userId: userToDelete.id } });
        await prisma.template.deleteMany({ where: { authorId: userToDelete.id } });

        await prisma.user.delete({ where: { id: userToDelete.id } });
        res.status(204).json({ message: 'User deleted successfully.' });
      } catch (error) {
        res.status(500).json({ error: 'Error deleting user.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}