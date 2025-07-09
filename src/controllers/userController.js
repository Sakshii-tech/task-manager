import { UserModel } from '../models/userModel.js';
import redisClient from '../config/redis.js';

class UserController {
  async getAll(req, res) {
    console.log('[GET] /api/v1/users');
    try {
      let users;

      if (redisClient.isOpen) {
        const cachedUsers = await redisClient.get('users:all');
        if (cachedUsers) {
          console.log('✅ Returning users from Redis cache');
          return res.json(JSON.parse(cachedUsers));
        }
      }

      console.log('Fetching users from DB');
      users = await UserModel.getAll();

      if (redisClient.isOpen) {
        await redisClient.set('users:all', JSON.stringify(users), { EX: 60 });
        console.log('Users cached for 60 seconds');
      }

      res.json(users);
    } catch (err) {
      console.error('Error fetching all users:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req, res) {
    console.log(`[GET] /api/v1/users/${req.params.id}`);
    try {
      const user = await UserModel.getById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      console.error('Error fetching user by ID:', err);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  async update(req, res) {
    console.log(`[PUT] /api/v1/users/${req.params.id}`);
    try {
      const user = await UserModel.update(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (redisClient.isOpen) {
        await redisClient.del('users:all');
      }

      res.json(user);
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  async remove(req, res) {
    console.log(`[DELETE] /api/v1/users/${req.params.id}`);
    try {
      const user = await UserModel.delete(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (redisClient.isOpen) {
        await redisClient.del('users:all');
      }

      res.json({ message: 'User deleted' });
    } catch (err) {
      console.error('Error deleting user:', err);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}

export default new UserController();
