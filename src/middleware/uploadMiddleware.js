import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads folder exists
const uploadsDir = path.join('uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/\s+/g, '-');
        const timestamp = Date.now();
        cb(null, `${name}-${timestamp}${ext}`);
    },
});

const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
];

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'];

export const upload = multer({
    storage,
     fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const mimetype = file.mimetype;

        if (!allowedMimeTypes.includes(mimetype) || !allowedExtensions.includes(ext)) {
            return cb(new Error('Only image files and PDFs are allowed'), false);
        }

        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, 
});