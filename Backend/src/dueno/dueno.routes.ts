import { Router } from 'express';
import { sanitizeDueno, findAll, findOne, add, updateDueno, remove, findPets} from './dueno.controller.js';

export const duenoRouter = Router();

duenoRouter.get("/", findAll);
duenoRouter.get("/:idUsuario", findOne);
duenoRouter.post("/", sanitizeDueno, add);
duenoRouter.put("/:idUsuario", sanitizeDueno, updateDueno);
duenoRouter.patch("/:idUsuario", sanitizeDueno, updateDueno);
duenoRouter.delete("/:idUsuario", remove);

// http://localhost:3000/api/duenos/{idUsuario}/MisMascotas
duenoRouter.get("/:idUsuario/MisMascotas", findPets); 
