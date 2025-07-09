import express from 'express';
import userController from '../../controllers/userController.js';
import { validate } from '../../middleware/validate.js';
import { userSchema } from '../../validators/userValidator.js';
import { protect } from '../../middleware/authMiddleware.js'; 
const router = express.Router();

router.get('/', protect,userController.getAll);
router.get('/:id',protect, userController.getById);
router.put('/:id',protect, validate(userSchema), userController.update);
router.delete('/:id',protect, userController.remove);

export default router;
