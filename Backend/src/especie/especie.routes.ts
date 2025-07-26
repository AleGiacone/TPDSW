import { Router } from "express";
import { sanitizeEspecie, findAll, findOne, add, update, remove } from "./especie.controller.js";

export const especieRouter = Router();

especieRouter.get("/", findAll);
especieRouter.get("/:idEspecie", findOne);
especieRouter.post("/", sanitizeEspecie, add);
especieRouter.put("/:idEspecie", sanitizeEspecie, update);
especieRouter.patch("/:idEspecie", sanitizeEspecie, update);
especieRouter.delete("/:idEspecie", remove);