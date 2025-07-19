import { Router } from "express";
import { sanitizeReserva, findAll, findOne, add, update, remove } from "./reserva.controller.js";

const reservaRouter = Router();

reservaRouter.get("/", findAll);
reservaRouter.get("/:idReserva", findOne);
reservaRouter.post("/", add);
reservaRouter.put("/:idReserva", update);
reservaRouter.delete("/:idReserva", remove);
reservaRouter.patch("/:idReserva", update);

