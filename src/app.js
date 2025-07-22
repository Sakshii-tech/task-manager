import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from './routes/v1/userRoutes.js';
import swaggerUI from 'swagger-ui-express';
import swaggerDefinition from './api-doc/v1/main_doc.js';
import authRoutes from './routes/v1/authRoutes.js';
import projectRoutes from './routes/v1/projectRoutes.js';
import taskRoutes from './routes/v1/taskRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRoutes from './routes/v1/uploadRoutes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config();

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// ✅ Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/uploads', uploadRoutes);

app.get('/', (req, res) => {
  res.send({ message: 'Task Management System API is running' });
});
app.use('api/v1/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/v1/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerDefinition));

app.use(errorHandler);

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
