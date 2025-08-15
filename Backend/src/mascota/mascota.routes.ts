import { Router } from 'express';
import { sanitizeMascota, findAll, findOne, add, update, remove, uploadFiles} from './mascota.controller.js';
import multer from 'multer';

const upload = multer({ dest: 'public/img/perfilImages' });

const mascotaRouter = Router();


mascotaRouter.get('/', findAll);
mascotaRouter.get('/:idMascota', findOne);
mascotaRouter.post('/', sanitizeMascota, add);
mascotaRouter.patch('/:idMascota', update);
mascotaRouter.put('/:idMascota', sanitizeMascota, update);
mascotaRouter.delete('/:idMascota', remove);

// Upload files localhost:3000/mascota/:idMascota/upload
mascotaRouter.post('/:idMascota/upload', upload.single('imageFile'), uploadFiles);

export { mascotaRouter };