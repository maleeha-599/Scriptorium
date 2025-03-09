import { verifyToken } from './jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Token not provided" });
    }

    // Check if the token is blacklisted, but skip this for admin users
    const decoded = verifyToken(token);
    if (decoded) {
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        });

        if (user?.is_admin) {
            req.userId = decoded.userId; // Allow admin to pass through
            return next();
        }
    }

    const blacklistedToken = await prisma.blacklistedToken.findUnique({
        where: { token },
    });
    if (blacklistedToken) {
        return res.status(401).json({ message: "Token is invalid" });
    }

    try {
        if (!decoded) {
            throw new Error("Invalid token");
        }
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(401).json({ message: "Token is invalid" });
    }
}