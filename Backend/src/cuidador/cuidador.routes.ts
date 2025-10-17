import { Router } from 'express';
import { sanitizeCuidador, findAll, findOne, add, update, remove, updateProfileImage, deleteProfileImage } from './cuidador.controller.js';
import multer from 'multer';
import path from 'path';

export const cuidadorRouter = Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/perfilImages');
  },
  filename: (req, file, cb) => {
    const uniqueName = `cuidador-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      (cb as any)(new Error('Solo se permiten imágenes'), false);
    }
  }
});


cuidadorRouter.get("/", findAll);
cuidadorRouter.get("/:idUsuario", findOne);
cuidadorRouter.post("/", sanitizeCuidador, add);
cuidadorRouter.put("/:idUsuario", sanitizeCuidador, update);
cuidadorRouter.patch("/:idUsuario", sanitizeCuidador, update);
cuidadorRouter.delete("/:idUsuario", remove);
cuidadorRouter.post("/:idUsuario/profile-image", upload.single('profileImage'), updateProfileImage);
cuidadorRouter.delete("/:idUsuario/profile-image", deleteProfileImage);