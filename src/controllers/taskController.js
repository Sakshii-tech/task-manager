// src/controllers/taskController.js

import TaskService from '../services/taskService.js';
import { successResponse } from '../utils/responseHandler.js';
import prisma from '../config/prismaClient.js';
import { checkUserActive } from '../utils/checkUserActive.js';

class TaskController {
  async createTask(req, res, next) {
    try {
      const userId = req.user.id;
      const encryptedProjectId = req.params.id;

      await checkUserActive(userId);

      const task = await TaskService.createTask(userId, encryptedProjectId, req.body);

      successResponse(res, 201, { message: 'Task created', task });
    } catch (err) {
      if (err.code === 'P2002') {
        const error = new Error('Task with this title already exists in this project.');
        error.code = 409;
        throw error;
      }
      throw err;

    }
  }


  async getAll(req, res, next) {
    try {
      const userId = req.user.id;

      await checkUserActive(userId);

      const tasks = await TaskService.getAllTasks(userId, req.query);

      successResponse(res, 200, { tasks });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const taskId = req.params.id;
      const { status } = req.body;

      await checkUserActive(userId); 

      const updatedTask = await TaskService.updateStatus(userId, taskId, status);

      successResponse(res, 200, { message: 'Task status updated', updatedTask });
    } catch (err) {
      next(err);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const analytics = await TaskService.getAnalytics();

      successResponse(res, 200, { analytics });
    } catch (err) {
      next(err);
    }
  }
}

export default new TaskController();
