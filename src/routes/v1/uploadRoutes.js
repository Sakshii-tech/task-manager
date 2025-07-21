import { Router } from 'express';
import { upload } from '../../middleware/uploadMiddleware.js';
import UploadController from '../../controllers/uploadController.js'; 
import { protect } from '../../middleware/authMiddleware.js';

const router = Router();

router.post('/tasks/:id/attachments',protect, upload.single('file'), UploadController.uploadAttachment);

export default router;