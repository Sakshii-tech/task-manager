import express from 'express';
import userController from '../../controllers/userController.js';
import { protect } from '../../middleware/authMiddleware.js'; 
const router = express.Router();

router.get('/', protect,userController.getAll);
router.get('/:id',protect, userController.getById);
router.put('/:id',protect, userController.update);
router.delete('/:id',protect, userController.remove);

export default router;
