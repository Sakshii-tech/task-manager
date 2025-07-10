// src/controllers/taskController.js

import TaskService from '../services/taskService.js';
import { successResponse } from '../utils/responseHandler.js';

class TaskController {
  async createTask(req, res, next) {
    try {
      const userId = req.user.id;
      const projectId = parseInt(req.params.id, 10);

      const task = await TaskService.createTask(userId, projectId, req.body);

      successResponse(res, 201, { message: 'Task created', task });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const userId = req.user.id;

      const tasks = await TaskService.getAllTasks(userId, req.query);

      successResponse(res, 200, { tasks });
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const taskId = Number(req.params.id);
      const { status } = req.body;

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
