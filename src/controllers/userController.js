import * as User from '../models/userModel.js';
import redisClient from '../config/redis.js';

class UserController {
  async create(req, res) {
    console.log('[POST] /api/users - Creating user');
    try {
      const user = await User.createUser(req.body);

      await redisClient.del('users:all');

      res.status(201).json(user);
    } catch (err) {
      console.error('❌ Error creating user:', err);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  async getAll(req, res) {
    console.log('[GET] /api/users - Checking Redis cache');
    try {
      if (!redisClient.isOpen) {
        console.log('Connecting to Redis...');
        await redisClient.connect();
      }

      const cachedUsers = await redisClient.get('users:all');
      if (cachedUsers) {
        console.log('✅ Returning users from Redis cache');
        return res.json(JSON.parse(cachedUsers));
      }

      console.log('🗄️ Fetching users from DB');
      const users = await User.getAllUsers();

      await redisClient.set('users:all', JSON.stringify(users), { EX: 60 });
      console.log('✅ Users cached for 60 seconds');

      res.json(users);
    } catch (err) {
      console.error('❌ Redis getAll error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req, res) {
    console.log(`[GET] /api/users/${req.params.id}`);
    try {
      const user = await User.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      console.error('❌ Error fetching user by ID:', err);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  async update(req, res) {
    console.log(`[PUT] /api/users/${req.params.id}`);
    try {
      const user = await User.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Optional: Invalidate cache
      await redisClient.del('users:all');

      res.json(user);
    } catch (err) {
      console.error('❌ Error updating user:', err);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  async remove(req, res) {
    console.log(`[DELETE] /api/users/${req.params.id}`);
    try {
      const user = await User.deleteUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Optional: Invalidate cache
      await redisClient.del('users:all');

      res.json({ message: 'User deleted' });
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}

export default new UserController();
