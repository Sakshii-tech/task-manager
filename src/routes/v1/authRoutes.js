import express from 'express';
import authController from '../../controllers/authController.js';
import { userSchema } from '../../validators/userValidator.js';
import { validate } from '../../middleware/validate.js';
const router = express.Router();

router.post('/register',validate(userSchema), authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);

export default router;
