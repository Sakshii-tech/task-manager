// src/services/taskService.js

import { TaskStatus } from '@prisma/client';
import prisma from '../config/prismaClient.js';
import redisClient from '../config/redis.js';
import { encryptId, decryptId } from '../utils/idUtils.js';

class TaskService {
  async createTask(userId, encryptedProjectId, taskData) {
    const projectId = decryptId(encryptedProjectId);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.creatorId !== userId) {
      const error = new Error('Project not found or access denied.');
      error.code = 404;
      throw error;
    }
    if (taskData.dueDate && isNaN(Date.parse(taskData.dueDate))) {
      const error = new Error('Invalid dueDate format. Expected ISO 8601 date string.');
      error.code = 400;
      throw error;
    }

    const task = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description || null,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        userId: userId,
        projectId,
      },
    });

  await redisClient.del(`tasks:project:${projectId}`);

  return {
    id: encryptId(task.id),
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    status: task.status
  };
}


  async getAllTasks(userId, query) {
    const { status, from, to, projectId: encryptedProjectId } = query;

    const filters = { userId };

    if (status){
      if (!Object.values(TaskStatus).includes(status)) {
      const error = new Error(`Invalid status. Allowed: ${Object.values(TaskStatus).join(', ')}`);
      error.code = 400;
      throw error;
    }
    filters.status = status;
   }

    if (from || to) {
      filters.dueDate = {};
      if (from) filters.dueDate.gte = new Date(from);
      if (to) filters.dueDate.lte = new Date(to);
    }

    // 🔒 Decrypt projectId if provided
    if (encryptedProjectId) {
      filters.projectId = decryptId(encryptedProjectId);
    }

    const cacheKey = `tasks:${userId}:${JSON.stringify(filters)}`;
    const cached = await redisClient.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const tasks = await prisma.task.findMany({
      where: filters,
      include: { project: true },
    });

    // 🔒 Encrypt IDs before caching/returning
    const encryptedTasks = tasks.map(task => ({
      id: encryptId(task.id),
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
      projectId: encryptId(task.projectId),
      updatedAt: task.updatedAt,
    }));

    await redisClient.set(cacheKey, JSON.stringify(encryptedTasks), { EX: 60 });

    return encryptedTasks;
  }

  async updateStatus(userId, encryptedTaskId, status) {
    if (!Object.values(TaskStatus).includes(status)) {
      const error = new Error(`Invalid status. Allowed: ${Object.values(TaskStatus).join(', ')}`);
      error.code = 400;
      throw error;
    }

    // 🔒 Decrypt task ID
    const taskId = decryptId(encryptedTaskId);

    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task || task.userId !== userId) {
      const error = new Error('Task not found');
      error.code = 404;
      throw error;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: status,
        updatedAt: new Date(),
      },
    });

    await redisClient.del(`tasks:${userId}:*`);

    // 🔒 Encrypt ID in response too
    return {
      id: encryptId(updated.id),
      title: updated.title,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
  }

  async getAnalytics() {
    const totalTasks = await prisma.task.count();

    const byStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const overdueTasks = await prisma.task.count({
      where: {
        dueDate: { lt: new Date() },
        status: { not: 'completed' },
      },
    });

    const tasksPerProject = await prisma.task.groupBy({
      by: ['projectId'],
      _count: { projectId: true },
    });

    return {
      totalTasks,
      byStatus: byStatus.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {}),
      overdueTasks,
      tasksPerProject: tasksPerProject.map(p => ({
        projectId: encryptId(p.projectId), // 🔒 Encrypt project IDs in analytics too!
        count: p._count.projectId,
      })),
    };
  }
}

export default new TaskService();
