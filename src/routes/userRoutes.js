import express from 'express';
import * as userController from '../controllers/userController.js';
import { validate } from '../middleware/validate.js';
import { userSchema } from '../validators/userValidator.js';

const router = express.Router();

router.post('/', validate(userSchema), userController.create);
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.put('/:id', validate(userSchema), userController.update);
router.delete('/:id', userController.remove);

export default router;
