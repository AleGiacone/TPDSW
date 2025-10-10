import { Router } from 'express';
import { sanitizeDueno, findAll, findOne, add, updateDueno, remove, findPets, authenticateDueno, authenticateUpdate
} from './dueno.controller.js';

export const duenoRouter = Router();

duenoRouter.get("/", findAll);
duenoRouter.get("/:idUsuario", findOne);
duenoRouter.post("/", sanitizeDueno, authenticateDueno, add);
duenoRouter.put("/:idUsuario", sanitizeDueno, authenticateUpdate, updateDueno);
duenoRouter.patch("/:idUsuario", sanitizeDueno, updateDueno);
duenoRouter.delete("/:idUsuario", remove);

// http://localhost:3000/api/duenos/{idUsuario}/MisMascotas
duenoRouter.get("/:idUsuario/MisMascotas", findPets); 
