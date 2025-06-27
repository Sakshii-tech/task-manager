import { createClient } from 'redis';

const redisClient = createClient({ url: 'redis://localhost:6379' });

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

await connectRedis(); // ✅ this ensures connection before export

export default redisClient;
