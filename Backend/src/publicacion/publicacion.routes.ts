import { Router } from 'express';
import { sanitizePublicacion, findAll, findOne, findByCuidador, add, update, remove } from './publicacion.controller.js';
export const publicacionRouter = Router();

publicacionRouter.get("/", findAll);
publicacionRouter.get("/cuidador/:idUsuario", findByCuidador);
publicacionRouter.get("/:idPublicacion", findOne);
publicacionRouter.post("/", sanitizePublicacion, add);
publicacionRouter.put("/:idPublicacion", sanitizePublicacion, update);
publicacionRouter.patch("/:idPublicacion", sanitizePublicacion, update);
publicacionRouter.delete("/:idPublicacion", remove);
