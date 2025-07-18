import prisma from '../config/prismaClient.js';

export async function checkUserActive(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, deletedAt: true },
  });

  if (!user || user.deletedAt) {
    const error = new Error('User is deleted or not found.');
    error.code = 403;
    throw error;
  }

  return user;
}
