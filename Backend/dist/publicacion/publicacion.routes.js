import { Router } from 'express';
import { sanitizePublicacion, findAll, findOne, add, update, remove } from './publicacion.controller.js';
export const publicacionRouter = Router();
publicacionRouter.get("/", findAll);
publicacionRouter.get("/:idPublicacion", findOne);
publicacionRouter.post("/", sanitizePublicacion, add);
publicacionRouter.put("/:idPublicacion", sanitizePublicacion, update);
publicacionRouter.patch("/:idPublicacion", sanitizePublicacion, update);
publicacionRouter.delete("/:idPublicacion", remove);
//# sourceMappingURL=publicacion.routes.js.map