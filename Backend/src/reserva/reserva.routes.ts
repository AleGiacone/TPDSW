import { Router } from "express";
import { sanitizeReserva, findAll, findOne, add, update, remove, authenticateAdd, testDate } from "./reserva.controller.js";

const reservaRouter = Router();

reservaRouter.get("/", findAll);
reservaRouter.get("/:idReserva", findOne);
reservaRouter.post("/", sanitizeReserva,authenticateAdd, add);
reservaRouter.put("/:idReserva", update);
reservaRouter.delete("/:idReserva", remove);
reservaRouter.patch("/:idReserva", update);
reservaRouter.post("/test-date", sanitizeReserva, testDate);

export { reservaRouter };
