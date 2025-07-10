import ProjectService from '../services/projectService.js';
import { successResponse } from '../utils/responseHandler.js';

class ProjectController {
  async create(req, res, next) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        const error = new Error('Unauthorized');
        error.code = 401;
        throw error;
      }

      const project = await ProjectService.createProject(userId, req.body);
      successResponse(res, 201, { message: 'Project created', project });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req, res, next) {
    try {
      const userId = req.user.id;

      const projects = await ProjectService.getAllProjects(userId);
      successResponse(res, 200, { projects });
    } catch (err) {
      next(err);
    }
  }
}

export default new ProjectController();
