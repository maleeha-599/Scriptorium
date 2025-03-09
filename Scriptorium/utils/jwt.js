
// import jwt from 'jsonwebtoken';

// export function generateAccessToken(userId, isAdmin) {
//     return jwt.sign({ userId, isAdmin }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
// }

// export function generateRefreshToken(userId) {
//     return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
// }


// export function verifyToken(token, secret) {
//     try {
//       return jwt.verify(token, secret);
//     } catch (error) {
//       return null;
//     }
//   }

// ChatGPT used for admin non-expiring token 

import jwt from 'jsonwebtoken';

export const generateToken = (userId, isAdmin) => {
    // Set expiration: 1 hour for regular users, no expiration for admin
    const expiresIn = isAdmin ? '1h' : '1h'; // 100 years for admin     //until we have the refresh token!!
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}