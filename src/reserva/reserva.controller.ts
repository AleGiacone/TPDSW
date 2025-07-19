import { Request, Response, NextFunction } from "express";
import { Reserva } from "./reserva.entity.js";
import { orm } from "../shared/db/orm.js";

function sanitizeReserva(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeInput = {
    idReserva: req.body.idReserva,
    fechaReserva: req.body.fechaReserva,
    horaReserva: req.body.horaReserva,
    dueno: req.body.dueno,
    mascota: req.body.mascota
  };
  Object.keys(req.body.sanitizeInput).forEach((key) => {
    if (req.body.sanitizeInput[key] === undefined) {
      delete req.body.sanitizeInput[key];
    }
  });
  next();
}

const em = orm.em;

async function findAll(req: Request, res: Response) {
  try {
    const reservas = await em.find(Reserva, {}, { populate: ["dueno", "mascotas"] });
    res.status(200).json({ message: "finded all reservas", data: reservas });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving reservas", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const idReserva = Number(req.params.idReserva);
    const reserva = await em.findOneOrFail(Reserva, { idReserva }, { populate: ["dueno", "mascotas"] });
    res.status(200).json({ message: "Reserva found", data: reserva });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving reserva", error: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const reserva = em.create(Reserva, req.body.sanitizeInput);
    await em.flush();
    res.status(200).json({ message: "Reserva created", data: reserva });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating reserva", error: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const idReserva = Number(req.params.idReserva);
    const reserva = await em.findOneOrFail(Reserva, { idReserva });
    em.assign(reserva, req.body.sanitizeInput);
    await em.flush();
    res.status(200).json({ message: "Reserva updated", data: reserva });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating reserva", error: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const idReserva = Number(req.params.idReserva);
    const reserva = await em.findOneOrFail(Reserva, { idReserva });
    await em.removeAndFlush(reserva);
    res.status(200).json({ message: "Reserva removed", data: reserva });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing reserva", error: error.message });
  }
}

export { sanitizeReserva, findAll, findOne, add, update, remove };