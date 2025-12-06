import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';

const uploadDir = path.join(process.cwd(), 'public/img/publicacionImages');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const sanitizedOriginalName = path.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 30);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const name = `${file.fieldname}-${sanitizedOriginalName}-${uniqueSuffix}${ext}`;
        cb(null, name);
    }
});

const uploadPublicacionImages = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 5,
    },
    fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten imágenes'));
        }
    }
});

const baseUpload = uploadPublicacionImages.array('images', 5);

export const publicacionImageUpload = (req: Request, res: Response, next: NextFunction) => {
    baseUpload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ 
                message: 'Error al procesar archivos', 
                error: err.message 
            });
        }
        next();
    });
};