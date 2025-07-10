import userService from '../services/userService.js';
import redisClient from '../config/redis.js';
import { successResponse } from '../utils/responseHandler.js';

class UserController {
  async getAll(req, res, next) {
    try {
      let users;

      if (redisClient.isOpen) {
        const cachedUsers = await redisClient.get('users:all');
        if (cachedUsers) {
          console.log('✅ Returning users from Redis cache');
          return successResponse(res, 200, JSON.parse(cachedUsers));
        }
      }

      users = await userService.getAll();

      if (redisClient.isOpen) {
        await redisClient.set('users:all', JSON.stringify(users), { EX: 60 });
        console.log('✅ Users cached for 60 seconds');
      }

      successResponse(res, 200, users);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const user = await userService.getById(req.params.id);
      successResponse(res, 200, user);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const user = await userService.update(req.params.id, req.body);

      if (redisClient.isOpen) {
        await redisClient.del('users:all');
      }

      successResponse(res, 200, user);
    } catch (err) {
      next(err);
    }
  }

  async remove(req, res, next) {
    try {
      await userService.remove(req.params.id);

      if (redisClient.isOpen) {
        await redisClient.del('users:all');
      }

      successResponse(res, 200, { message: 'User deleted' });
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
