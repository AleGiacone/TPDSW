import { Router } from "express";
import { sanitizeReserva, findAll, findOne, add, update, remove, authenticateAdd, verifyDate, testDate } from "./reserva.controller.js";

const reservaRouter = Router();

reservaRouter.get("/", findAll);
reservaRouter.get("/:idReserva", findOne);

//Agregar el authenticateAdd middleware
reservaRouter.post("/", sanitizeReserva, verifyDate, add);
reservaRouter.put("/:idReserva", update);
reservaRouter.delete("/:idReserva", remove);
reservaRouter.patch("/:idReserva", update);
reservaRouter.post("/test-date", sanitizeReserva, testDate);



export { reservaRouter };
