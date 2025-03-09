import { PrismaClient } from '@prisma/client';
import { generateAccessToken, verifyToken } from '../../../utils/jwt';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Retrieve the refresh token from the HTTP-only cookie
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

    // Generate a new access token
    const newAccessToken = generateAccessToken(user.id, user.is_admin);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
}
