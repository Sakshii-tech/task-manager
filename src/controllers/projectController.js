import ProjectService from '../services/projectService.js';
import { successResponse } from '../utils/responseHandler.js';
import prisma from '../config/prismaClient.js';

class ProjectController {
  async create(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        const error = new Error('Unauthorized');
        error.code = 401;
        throw error;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, deletedAt: true },
      });
      if (!user || user.deletedAt) {
        const error = new Error('User is deleted or not found.');
        error.code = 403; // Forbidden
        throw error;
      }

      const project = await ProjectService.createProject(userId, req.body);
      successResponse(res, 201, { message: 'Project created', project });
    } catch (err) {
      if (err.code === 'P2002') {
        return res.status(409).json({ error: 'A project with this name already exists.' });
      }
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, deletedAt: true },
      });
      if (!user || user.deletedAt) {
        const error = new Error('User is deleted or not found.');
        error.code = 403; // Forbidden
        throw error;
      }

      const projects = await ProjectService.getAllProjects(userId);
      successResponse(res, 200, { projects });
    } catch (err) {
      next(err);
    }
  }
}

export default new ProjectController();
