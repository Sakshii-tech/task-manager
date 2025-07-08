import prisma from '../config/prismaClient.js';
import { hashPassword, comparePasswords } from '../utils/hashUtils.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwtUtils.js';

class AuthController {
    async register(req, res) {
        const { name, email, password } = req.body;

        try {
            const existing = await prisma.user.findUnique({ where: { email } });
            if (existing) return res.status(400).json({ error: 'Email already exists' });

            const hashed = await hashPassword(password);
            const user = await prisma.user.create({
                data: { name, email, password: hashed },
            });

            res.status(201).json({ message: 'User registered', user: { id: user.id, email: user.email } });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Registration failed' });
        }
    }

    async login(req, res) {
        const { email, password } = req.body;

        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) return res.status(400).json({ error: 'Invalid credentials' });

            const valid = await comparePasswords(password, user.password);
            if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            // Store refresh token if you want to revoke later (optional)
            res.json({ accessToken, refreshToken });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Login failed' });
        }
    }

    async refresh(req, res) {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided' });

        try {
            const payload = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await prisma.user.findUnique({ where: { id: payload.id } });
            if (!user) return res.status(401).json({ error: 'Invalid refresh token' });

            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user);

            res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        } catch (err) {
            console.error(err);
            res.status(403).json({ error: 'Invalid or expired refresh token' });
        }
    }
}

export default new AuthController();
