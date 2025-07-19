import { Router } from 'express';
import { sanitizeDueno, findAll, findOne, add, update, remove } from './dueno.controller.js';

export const duenoRouter = Router();

duenoRouter.get("/", findAll);
duenoRouter.get("/:idDueno", findOne);
duenoRouter.post("/", sanitizeDueno, add);
duenoRouter.put("/:idDueno", sanitizeDueno, update);
duenoRouter.patch("/:idDueno", sanitizeDueno, update);
duenoRouter.delete("/:idDueno", remove);