import { Router } from 'express';
import { sanitizePublicacion, findAll, findOne, findByCuidador, add, update, remove } from './publicacion.controller.js';
import { publicacionImageUpload } from '../shared/multer.config.js';

export const publicacionRouter = Router();

publicacionRouter.get("/", findAll);
publicacionRouter.get("/cuidador/:idUsuario", findByCuidador);
publicacionRouter.get("/:idPublicacion", findOne);
publicacionRouter.post("/", publicacionImageUpload, sanitizePublicacion, add);
publicacionRouter.put('/:idPublicacion', publicacionImageUpload, sanitizePublicacion, update);
publicacionRouter.patch("/:idPublicacion", sanitizePublicacion, update);
publicacionRouter.delete("/:idPublicacion", remove);
