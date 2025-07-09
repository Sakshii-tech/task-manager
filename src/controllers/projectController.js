import prisma from "../config/prismaClient.js"; // adjust path if needed
import redisClient from "../config/redis.js";

class ProjectController {
  async create(req, res) {
    try {
      const { name, description } = req.body;

      // Use userId from JWT payload
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const project = await prisma.project.create({
        data: {
          name,
          description,
          creatorId: userId 
        },
      });

      res.status(201).json(project);
    } catch (err) {
      console.error(" Error creating project:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
   async getAll(req, res) {
  const userId = req.user.id;

  const cacheKey = `projects:user:${userId}`;

  try {
    // Check Redis
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log('Projects from cache');
      return res.json(JSON.parse(cached));
    }

    // Fetch from DB
    const projects = await prisma.project.findMany({
      where: { creatorId: userId },
    });

    // Cache them
    await redisClient.set(cacheKey, JSON.stringify(projects), { EX: 60 });

    res.json(projects);
  } catch (err) {
    console.error(' Error getting projects:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
}

export default new ProjectController();
