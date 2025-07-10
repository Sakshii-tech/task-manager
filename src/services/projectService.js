// src/services/projectService.js

import prisma from '../config/prismaClient.js';
import redisClient from '../config/redis.js';

class ProjectService {
    async createProject(userId, data) {
        const project = await prisma.project.create({
            data: {
                name: data.name,
                description: data.description,
                creatorId: userId,
            },
        });
        return project;
    }

    async getAllProjects(userId) {
        const cacheKey = `projects:user:${userId}`;

        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const projects = await prisma.project.findMany({
            where: { creatorId: userId },
        });

        await redisClient.set(cacheKey, JSON.stringify(projects), { EX: 60 });

        return projects;
    }
}

export default new ProjectService();
