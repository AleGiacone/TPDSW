import { Router } from 'express';
import { sanitizeDueno, findAll, findOne, add, updateDueno, remove } from './dueno.controller.js';

export const duenoRouter = Router();

duenoRouter.get("/", findAll);
duenoRouter.get("/:idUsuario", findOne);
duenoRouter.post("/", sanitizeDueno, add);
duenoRouter.put("/:idUsuario", sanitizeDueno, updateDueno);
duenoRouter.patch("/:idUsuario", sanitizeDueno, updateDueno);
duenoRouter.delete("/:idUsuario", remove);