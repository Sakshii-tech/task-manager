import prisma from '../config/prismaClient.js';
import { hashPassword, comparePasswords } from '../utils/hashUtils.js';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwtUtils.js';
import { encryptId } from '../utils/idUtils.js';

class AuthService {
  async register({ name, email, password }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const error = new Error('Email already exists');
      error.code = 400;
      throw error;
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    // ✅ Auto-generate tokens immediately
    const accessToken = generateAccessToken(user); // Stores real DB ID inside
    const refreshToken = generateRefreshToken(user);

    return {
      id: encryptId(user.id),   // Hide real DB ID in response
      email,
      accessToken,
      refreshToken
    };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique(
      { 
        where: { 
        email ,
        deletedAt: null,
        }
      });
    if (!user) {
      const error = new Error('Invalid credentials or account is deleted');
      error.code = 400;
      throw error;
    }

    const valid = await comparePasswords(password, user.password);
    if (!valid) {
      const error = new Error('Invalid credentials');
      error.code = 400;
      throw error;
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      const error = new Error('No refresh token provided');
      error.code = 401;
      throw error;
    }

    const payload = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      const error = new Error('Invalid refresh token');
      error.code = 401;
      throw error;
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}

export default new AuthService();
