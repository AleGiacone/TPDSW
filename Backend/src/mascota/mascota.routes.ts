import { Router } from 'express';
import { sanitizeMascota, findAll, findOne, findByOwner, add, update, remove, uploadFiles } from './mascota.controller.js';
import { removeMascotaImage } from '../imagen/imagenes.controller.js';
import multer from 'multer';
import path from 'path';

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/perfilImages/');
  },
  filename: (req, file, cb) => {
    // Generar nombre único para evitar colisiones
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'mascota-' + uniqueSuffix + extension);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const mascotaRouter = Router();

// Rutas básicas de mascotas
mascotaRouter.get('/duenos/:id', findByOwner);
mascotaRouter.get('/', findAll);
mascotaRouter.get('/:idMascota', findOne);
mascotaRouter.post('/', sanitizeMascota, add);
mascotaRouter.patch('/:idMascota', update);
mascotaRouter.put('/:idMascota', sanitizeMascota, update);
mascotaRouter.delete('/:idMascota', remove);

// Rutas para manejo de imágenes
mascotaRouter.post('/:idMascota/upload', upload.single('imageFile'), uploadFiles);
mascotaRouter.delete('/:idMascota/imagen', removeMascotaImage);

export { mascotaRouter };