// src/services/userService.js

import prisma from '../config/prismaClient.js';
import { encryptId, decryptId } from '../utils/idUtils.js';

class UserService {
  async getAll() {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: {
        id: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // 🔒 Encrypt all user IDs before returning
    return users.map(user => ({
      ...user,
      id: encryptId(user.id),
    }));
  }

  async getById(encryptedId) {
    const id = decryptId(encryptedId);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    if (user.deletedAt) {
      throw new Error('User not found'); // treat as not found
    }

    return {
      ...user
    };
  }

  async update(encryptedId, data) {
    const id = decryptId(encryptedId);
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id }, // Exclude current user
        },
      });

      if (existing) {
        const error = new Error('Email is already in use by another user.');
        error.status = 400;
        throw error;
      }
    }

    // Do NOT allow password updates here:
    delete data.password;

    const user = await prisma.user.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name: data.name,
        email: data.email,
      },
    })
    if (user.count === 0) {
      const error = new Error('User not found or already deleted.');
      error.status = 404;
      throw error;
    }
    if (data.email) {
      const duplicate = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        }
      })
      if (duplicate) {
        const error = new Error("email already in database");
        error.status = 400;
        throw error;
      }
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        email: true,
        createdAt: true,
      }
    });

    return {
      ...updatedUser,
    };
  }

  async remove(encryptedId) {
    const id = decryptId(encryptedId);

    const user = await prisma.user.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(), // mark as deleted now
      },
    });

    if (user.count === 0) {
      const error = new Error('User not found or already deleted.');
      error.status = 404;
      throw error;
    }

    const deletedUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        deletedAt: true,
      },
    });

    return {
      name: deletedUser.name,
      email: deletedUser.email,
      deletedAt: deletedUser.deletedAt,
    };
  }

}

export default new UserService();
