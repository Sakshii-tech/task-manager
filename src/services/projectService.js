// src/services/projectService.js

import prisma from '../config/prismaClient.js';
import redisClient from '../config/redis.js';
import { encryptId } from '../utils/idUtils.js';

class ProjectService {
  async createProject(userId, data) {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        creatorId: userId,
      },
    });

    const cacheKey = `projects:user:${userId}`;
    await redisClient.del(cacheKey);

    //  Encrypt ID before returning
    return {
      id: encryptId(project.id),
      name: project.name,
      description: project.description,
    };
  }

  async getAllProjects(userId) {
    const cacheKey = `projects:user:${userId}`;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const projects = await prisma.project.findMany({
      orderBy :{
        id : 'desc'
      }, 
      where: { creatorId: userId },
    });

    // Encrypt all project IDs before caching/returning
    const projectsWithEncryptedIds = projects.map(project => ({
      id: encryptId(project.id),
      name: project.name,
      description: project.description,
      creatorId: encryptId(project.creatorId), // Optional
    }));

    await redisClient.set(cacheKey, JSON.stringify(projectsWithEncryptedIds), { EX: 60 });

    return projectsWithEncryptedIds;
  }
}

export default new ProjectService();
