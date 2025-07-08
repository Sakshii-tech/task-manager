import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from './routes/v1/userRoutes.js';
import swaggerUI from 'swagger-ui-express';
import swaggerDefinition from './api-doc/v1/main_doc.js';

dotenv.config();

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// ✅ Routes
app.use('/api/v1/users', userRoutes);

app.get('/', (req, res) => {
  res.send({ message: 'Task Management System API is running' });
});

app.use('/v1/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerDefinition));

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
