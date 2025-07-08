// src/routes/v1/taskRoutes.js

import { Router } from 'express';
import TaskController from '../../controllers/taskController.js';
import {protect} from '../../middleware/authMiddleware.js'; // your JWT middleware

const router = Router();

// POST /api/projects/:id/tasks
router.post('/projects/:id/tasks', protect, TaskController.createTask);
router.get('/', protect, TaskController.getAll);
router.put( '/:id/status', protect, TaskController.updateStatus);
router.get('/analytics', TaskController.getAnalytics);


export default router;