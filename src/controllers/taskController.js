// src/controllers/taskController.js

import prisma from '../config/prismaClient.js';
import redisClient from '../config/redis.js';

class TaskController {
  async createTask(req, res) {
    const userId = req.user.id; 
    const projectId = parseInt(req.params.id, 10);
    const { title, description, dueDate } = req.body;

    console.log(`[POST] /api/projects/${projectId}/tasks - Creating task for user ${userId}`);

    try {
      // Check if project exists & belongs to user
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project || project.creatorId !== userId) {
        return res.status(404).json({ error: 'Project not found or access denied.' });
      }

      // Create the task
      const task = await prisma.task.create({
        data: {
          title,
          description: description || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          userId,
          projectId,
        },
      });

      await redisClient.del(`tasks:project:${projectId}`);

      res.status(201).json(task);
    } catch (err) {
      console.error(' Error creating task:', err);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

   async getAll(req, res) {
    try {
      const userId = req.user.id;

      // Build filters
      const { status, from, to, projectId } = req.query;

      const filters = {
        userId,
      };

      if (status) filters.status = status;

      if (from || to) {
        filters.dueDate = {};
        if (from) filters.dueDate.gte = new Date(from);
        if (to) filters.dueDate.lte = new Date(to);
      }
       console.log('Filters:', filters);

      if (projectId) filters.projectId = Number(projectId);

      const cacheKey = `tasks:${userId}:${JSON.stringify(req.query)}`;
      const cached = await redisClient.get(cacheKey);

      if (cached) {
        console.log('Returning tasks from Redis');
        return res.json(JSON.parse(cached));
      }

      // Fetch from DB
      const tasks = await prisma.task.findMany({
        where: filters,
        include: { project: true }, // optional: also get project info
      });

      // Cache for 60 sec
      await redisClient.set(cacheKey, JSON.stringify(tasks), { EX: 60 });

      res.json(tasks);
    } catch (err) {
      console.error(' Error fetching tasks:', err);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

 async updateStatus(req, res) {
  try {
    const userId = req.user.id;
    const taskId = Number(req.params.id);
    const { status } = req.body;

    const ALLOWED_STATUSES = ['pending', 'in_progress', 'completed'];

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task || task.userId !== userId) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    await redisClient.del(`tasks:${userId}:*`);

    res.json(updated);
  } catch (err) {
    console.error(' Error updating task status:', err);
    res.status(500).json({ error: 'Failed to update task status' });
  }
}
async getAnalytics(req, res) {
  try {
    const totalTasks = await prisma.task.count();

    const byStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const overdueTasks = await prisma.task.count({
      where: {
        dueDate: {
          lt: new Date(),
        },
        status: {
          not: 'completed',
        },
      },
    });

    const tasksPerProject = await prisma.task.groupBy({
      by: ['projectId'],
      _count: { projectId: true },
    });

    res.json({
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
    });
  } catch (err) {
    console.error('Error in analytics:', err);
    res.status(500).json({ error: 'Failed to get task analytics' });
  }
}
}

export default new TaskController();
