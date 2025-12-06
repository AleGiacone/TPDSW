import { Router } from 'express';
import { sanitizeDueno, findAll, findOne, add, updateDueno, remove, findPets, authenticateDueno, authenticateUpdate, updateProfileImageDueno, deleteProfileImageDueno
} from './dueno.controller.js';
import multer from 'multer'; 
import path from 'path';

export const duenoRouter = Router();
const storage = multer.diskStorage({
 destination: (req, file, cb) => {
  cb(null, 'public/img/perfilImages');
 },
 filename: (req, file, cb) => {
  const uniqueName = `dueno-${Date.now()}${path.extname(file.originalname)}`; 
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

duenoRouter.post("/:idUsuario/profile-image", upload.single('profileImage'), updateProfileImageDueno); 
duenoRouter.delete("/:idUsuario/profile-image", deleteProfileImageDueno); 

duenoRouter.get("/:idUsuario/MisMascotas", findPets); 
duenoRouter.get("/", findAll);
duenoRouter.get("/:idUsuario", findOne);
duenoRouter.post("/", sanitizeDueno, authenticateDueno, add);
duenoRouter.delete("/:idUsuario", remove);
duenoRouter.put("/:idUsuario", sanitizeDueno, authenticateUpdate, updateDueno);
duenoRouter.patch("/:idUsuario", sanitizeDueno, updateDueno);