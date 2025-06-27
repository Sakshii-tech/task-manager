import * as User from '../models/userModel.js';
import redisClient from '../config/redis.js'; 

export const create = async (req, res) => {
    console.log('create');
  try {
    const user = await User.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const getAll = async (req, res) => {
  try {
    console.log(' [GET] /api/users - Checking Redis cache');

    // 1. Ensure Redis is connected
    if (!redisClient.isOpen) {
      console.log('Connecting to Redis...');
      await redisClient.connect();
    }

    // 2. Try to get cached users
    const cachedUsers = await redisClient.get('users:all');
    if (cachedUsers) {
      console.log('✅ Returning users from cache');
      return res.json(JSON.parse(cachedUsers));
    }

    // 3. Fetch users from DB
    console.log('🗄️ Fetching users from DB');
    const users = await User.getAllUsers();

    // 4. Cache users with TTL (60 seconds)
    await redisClient.set('users:all', JSON.stringify(users), {
      EX: 60,
    });

    console.log('✅ Users cached successfully');
    res.json(users);
  } catch (err) {
    console.error('❌ Redis getAll error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getById = async (req, res) => {
  try {
    const user = await User.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const update = async (req, res) => {
  try {
    const user = await User.updateUser(req.params.id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const remove = async (req, res) => {
  try {
    const user = await User.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
