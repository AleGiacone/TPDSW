import { Router } from "express";
import { sanitizeTipo, findAll, findOne, add, update, remove } from "./tipo.controler.js";
export const tipoRouter = Router();
tipoRouter.get("/", findAll);
tipoRouter.get("/:raza", findOne);
tipoRouter.post("/", sanitizeTipo, add);
tipoRouter.put("/:raza", sanitizeTipo, update);
tipoRouter.patch("/:raza", sanitizeTipo, update);
tipoRouter.delete("/:raza", remove);
//# sourceMappingURL=tipo.routes.js.map