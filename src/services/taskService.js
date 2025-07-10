// src/services/taskService.js

import prisma from '../config/prismaClient.js';
import redisClient from '../config/redis.js';

class TaskService {
    async createTask(userId, projectId, taskData) {
        // Validate project
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        });

        if (!project || project.creatorId !== userId) {
            const error = new Error('Project not found or access denied.');
            error.code = 404;
            throw error;
        }

        const task = await prisma.task.create({
            data: {
                title: taskData.title,
                description: taskData.description || null,
                dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
                userId,
                projectId,
            },
        });

        await redisClient.del(`tasks:project:${projectId}`);

        return task;
    }

    async getAllTasks(userId, query) {
        const { status, from, to, projectId } = query;

        const filters = { userId };

        if (status) filters.status = status;

        if (from || to) {
            filters.dueDate = {};
            if (from) filters.dueDate.gte = new Date(from);
            if (to) filters.dueDate.lte = new Date(to);
        }

        if (projectId) filters.projectId = Number(projectId);

        const cacheKey = `tasks:${userId}:${JSON.stringify(query)}`;
        const cached = await redisClient.get(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }

        const tasks = await prisma.task.findMany({
            where: filters,
            include: { project: true },
        });

        await redisClient.set(cacheKey, JSON.stringify(tasks), { EX: 60 });

        return tasks;
    }

    async updateStatus(userId, taskId, status) {
        const ALLOWED_STATUSES = ['pending', 'in_progress', 'completed'];
        if (!ALLOWED_STATUSES.includes(status)) {
            const error = new Error(`Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`);
            error.code = 400;
            throw error;
        }

        const task = await prisma.task.findUnique({ where: { id: taskId } });

        if (!task || task.userId !== userId) {
            const error = new Error('Task not found');
            error.code = 404;
            throw error;
        }

        const updated = await prisma.task.update({
            where: { id: taskId },
            data: { status },
        });

        await redisClient.del(`tasks:${userId}:*`);

        return updated;
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
                projectId: p.projectId,
                count: p._count.projectId,
            })),
        };
    }
}

export default new TaskService();
