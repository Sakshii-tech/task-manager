import uploadService from "../services/uploadService.js";
import { checkUserActive } from "../utils/checkUserActive.js";
import { successResponse } from "../utils/responseHandler.js";

class UploadController {
   async uploadAttachment(req, res, next) {
  try {
    const userId = req.user.id;
    const encryptedTaskId = req.params.id;

    await checkUserActive(userId);

    if (!req.file) {
      const error = new Error('No file uploaded');
      error.code = 400;
      throw error;
    }
    const uploadedAttachment = await uploadService.uploadAttachment(
      userId,
      encryptedTaskId,
      req.file
    );

    successResponse(res, 201, {
      message: 'Attachment uploaded successfully',
      attachment: uploadedAttachment,
    });
  } catch (err) {
    next(err);
  }
}
}

export default new UploadController();