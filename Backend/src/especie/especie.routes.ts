import { Router } from "express";
import { sanitizeEspecie, findAll, findOne, add, update, remove } from "./especie.controller.js";
import { adminAuthenticate } from "../admin/admin.controller.js";

export const especieRouter = Router();

especieRouter.get("/", findAll);
especieRouter.get("/:idEspecie", findOne);
especieRouter.post("/", sanitizeEspecie, adminAuthenticate, add);
especieRouter.put("/:idEspecie", sanitizeEspecie, adminAuthenticate, update);
especieRouter.patch("/:idEspecie", sanitizeEspecie, adminAuthenticate, update);
especieRouter.delete("/:idEspecie", adminAuthenticate, remove);