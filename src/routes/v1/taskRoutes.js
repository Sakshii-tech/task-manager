// src/routes/v1/taskRoutes.js

import { Router } from 'express';
import TaskController from '../../controllers/taskController.js';
import {protect} from '../../middleware/authMiddleware.js'; // your JWT middleware
import { createTaskSchema } from '../../validators/taskValidator.js';
import { validate } from '../../middleware/validate.js';
import { upload } from '../../middleware/uploadMiddleware.js';

const router = Router();

// POST /api/projects/:id/tasks
router.post('/projects/:id/tasks', protect, upload.single('attachment'), validate(createTaskSchema) ,  TaskController.createTask);
router.get('/', protect, TaskController.getAll);
router.put( '/:id/status', protect, TaskController.updateStatus);
router.get('/analytics', TaskController.getAnalytics);


export default router;