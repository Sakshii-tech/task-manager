import { decryptId, encryptId } from '../utils/idUtils.js';
import prisma from '../config/prismaClient.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

class UploadService {
    async uploadAttachment(userId, encryptedTaskId, file) {
        const taskId = decryptId(encryptedTaskId);

        const task = await prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task || task.userId !== userId) {
            const error = new Error('Task not found or unauthorized');
            error.code = 404;
            throw error;
        }

        const width = parseInt(process.env.IMAGE_RESIZE_WIDTH);
        const height = parseInt(process.env.IMAGE_RESIZE_HEIGHT);

        const filePath = file.path;
        let finalFilePath = filePath;

        const isImage = file.mimetype.startsWith('image/');

        if (isImage && width && height) {
            const ext = path.extname(filePath);
            const name = path.basename(filePath, ext);
            const resizedPath = path.join(path.dirname(filePath), `${name}-resized${ext}`);
            console.log(`Resizing image to ${width}x${height} and saving to ${resizedPath}`);

            await sharp(filePath)
                .resize(width, height)
                .toFile(resizedPath);

            fs.unlinkSync(filePath);

            finalFilePath = resizedPath;
        }

        const attachment = await prisma.taskAttachment.create({
            data: {
                fileUrl: finalFilePath,
                taskId: task.id,
            },
        });

        return {
            id: encryptId(attachment.id),
            fileUrl: attachment.fileUrl,
            uploadedAt: attachment.uploadedAt,
        };
    }
}

export default new UploadService();