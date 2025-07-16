import userService from '../services/userService.js';
import redisClient from '../config/redis.js';
import { successResponse } from '../utils/responseHandler.js';
import { decryptId } from '../utils/idUtils.js';

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
        const currentUserId = req.user.id;
        const encryptedId = req.params.id;
        if(currentUserId!== decryptId(encryptedId)){
          const error = new  Error("You cannot update other user");
          error.status = 403;
          throw error;
        }
        
      const user = await userService.update(encryptedId, req.body);

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
     const deleted= await userService.remove(req.params.id);

      if (redisClient.isOpen) {
        await redisClient.del('users:all');
      }

      successResponse(res, 200, deleted);
    } catch (err) {
      next(err);
    }
  }
}

export default new UserController();
