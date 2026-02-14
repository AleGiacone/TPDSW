import { Router } from "express";
import { sanitizeReserva, findAll, findOne, add, update, remove, authenticateAdd, verifyDate, testDate, stripeWebHook, testPagoStripe} from "./reserva.controller.js";
import express from "express";

const reservaRouter = Router();

reservaRouter.get("/", findAll);
reservaRouter.get("/:idReserva", findOne);

//Agregar el authenticateAdd middleware
reservaRouter.post("/", sanitizeReserva, verifyDate, add);
reservaRouter.put("/:idReserva", update);
reservaRouter.delete("/:idReserva", remove);
reservaRouter.patch("/:idReserva", update);
reservaRouter.post("/test-date", sanitizeReserva, testDate);
reservaRouter.post("/test-pago", sanitizeReserva, testPagoStripe);


// STRIPE 
const webHookRouter = Router();

webHookRouter.post('/', stripeWebHook);


export { reservaRouter, webHookRouter };
