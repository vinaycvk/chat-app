import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { createClient } from 'redis';
import userRoutes from './routes/user.routes.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import cors from 'cors';
dotenv.config();
connectDB();
connectRabbitMQ();
export const redisClient = createClient({
    url: process.env.REDIS_URL ?? ''
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));
await redisClient.connect().then(() => {
    console.log('Connected to Redis');
}).catch((err) => {
    console.error('Redis connection error:', err);
});
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
app.use('/api/v1/users', userRoutes);
app.listen(PORT, () => {
    console.log(`User service is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map