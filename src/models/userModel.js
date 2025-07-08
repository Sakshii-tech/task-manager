// src/models/userModel.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserModel {
  static async create({ name, email }) {
    console.log('Creating user with Prisma:', { name, email });
    return await prisma.user.create({
      data: { name, email },
    });
  }

  static async getAll() {
    return await prisma.user.findMany({
      orderBy: { id: 'asc' },
    });
  }

  static async getById(id) {
    return await prisma.user.findUnique({
      where: { id: Number(id) },
    });
  }

  static async update(id, { name, email }) {
    return await prisma.user.update({
      where: { id: Number(id) },
      data: { name, email },
    });
  }

  static async delete(id) {
    return await prisma.user.delete({
      where: { id: Number(id) },
    });
  }
}
