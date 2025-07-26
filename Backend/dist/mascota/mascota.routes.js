import { Router } from 'express';
import { sanitizeMascota, findAll, findOne, add, update, remove } from './mascota.controller.js';
const mascotaRouter = Router();
mascotaRouter.get('/', findAll);
mascotaRouter.get('/:idMascota', findOne);
mascotaRouter.post('/', sanitizeMascota, add);
mascotaRouter.put('/:idMascota', sanitizeMascota, update);
mascotaRouter.delete('/:idMascota', remove);
mascotaRouter.patch('/:idMascota', sanitizeMascota, update);
//# sourceMappingURL=mascota.routes.js.map