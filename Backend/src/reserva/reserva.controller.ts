import e, { Request, Response, NextFunction } from "express";
import { Reserva } from "./reserva.entity.js";
import { orm } from "../shared/db/orm.js";
import { authenticate } from "../usuario/usuario.controller.js";
import { Publicacion } from "../publicacion/publicacion.entity.js";
import { Dueno } from "../dueno/dueno.entity.js";
import { nextTick } from "process";
import { Mascota } from "../mascota/mascota.entity.js"
import { Usuario } from "../usuario/usuario.entity.js";
import { publicDecrypt } from "crypto";
import { Temporal } from 'temporal-polyfill'



function sanitizeReserva(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizeInput = {
    idReserva: req.body.idReserva,
    fechaReserva: new Date(req.body.fechaReserva),
    fechaDesde: Temporal.PlainDate.from(req.body.fechaDesde.toString()), //
    fechaHasta: Temporal.PlainDate.from(req.body.fechaHasta.toString()), //
    descripcion: req.body.descripcion,
    horaReserva: req.body.horaReserva,
    idDueno: req.body.idDueno,
    idMascotas: req.body.idMascotas,
    idPublicacion: req.body.idPublicacion,
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
    const reserva = await em.findOneOrFail(Reserva, { idReserva }, { populate: ["dueno", "mascotas","publicacion"] });
    res.status(200).json({ message: "Reserva found", data: reserva });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving reserva", error: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {

    const reserva = em.create(Reserva, req.body.sanitizeInput);
    req.body.sanitizeInput.idMascotas.forEach( async (idMascota: number) => {
      const mascota = await em.findOneOrFail(Mascota, { idMascota: idMascota, dueno: req.body.sanitizeInput.idDueno });
      reserva.mascotas.add(mascota);
    })
    const publi = await em.findOneOrFail(Publicacion, { idPublicacion: req.body.sanitizeInput.idPublicacion });
    reserva.publicacion = publi;
    publi.reservas.add(reserva)
    const dueno = await em.findOneOrFail(Dueno, { idUsuario: req.body.sanitizeInput.idDueno }, { populate: ['mascotas','reservas'] });
    reserva.dueno = dueno;
    console.log("Adding reserva with data:", reserva);
    await em.flush();
    res.status(200).json({ message: "Reserva created", data: reserva });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating reserva", error: error.message });
  }
}

async function authenticateAdd(req: Request, res: Response, next: NextFunction) {
  console.log("Authenticating reserva with data:", req.body.sanitizeInput);
  try {
    if (!req.body.fechaDesde >= req.body.fechaHasta) {
      res.status(400).json({ message: "Fechas invalidas"})
    }
    
    const publi = await em.findOneOrFail(Publicacion, { idPublicacion: req.body.sanitizeInput.idPublicacion });
    if( !publi) {
      res.status(400).json({ message: "Publicacion no existe"})
    }
    console.log("id dueno", req.body.sanitizeInput.idDueno)
    const dueno = await em.findOneOrFail(Dueno, { idUsuario: req.body.sanitizeInput.idDueno });
    if( !dueno) {
      res.status(400).json({ message: "Dueno no existe"})
    }

    const reservaExistente = await em.findOne(Reserva, {fechaDesde: req.body.sanitizeInput.fechaDesde, publicacion: req.body.sanitizeInput.idPublicacion});
    if(reservaExistente) {
      res.status(400).json({ message: "Ya existe una reserva para esa publicacion en esa fecha"})
    }
    console.log("id mascotas", req.body.sanitizeInput.idMascotas)
    req.body.sanitizeInput.idMascotas.forEach( async (idMascota: number) => {
      const mascota = await em.findOneOrFail(Mascota, { idMascota: idMascota, dueno: req.body.sanitizeInput.idDueno });
      if( !mascota) {
        res.status(400).json({ message: `La mascota con id ${idMascota} no existe o no pertenece al dueno`})
      }
    })

    next();
  } catch (error: any) {
    res.status(500).json({ message: "Error authenticating reserva", error: error.message });
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


async function testDate(req: Request, res: Response) {
  console.log("Testing date with data:", req.body.sanitizeInput);
  try {
    if (req.body.sanitizeInput.fechaDesde.toString() >= req.body.sanitizeInput.fechaHasta.toString()) {
      res.status(400).json({ message: "Fechas invalidas"})
    }
    console.log("Fechas validas");
    console.log("req.body.sanitizeInput.fechaDesde:", req.body.sanitizeInput.fechaDesde);
    console.log("req.body.sanitizeInput.fechaHasta:", req.body.sanitizeInput.fechaHasta);
    console.log(req.body.sanitizeInput.fechaDesde.until(req.body.sanitizeInput.fechaHasta).toString())

    await em.flush();
  } catch (error: any) {
    res.status(500).json({ message: "Error creating reserva", error: error.message });
  }
}

export { sanitizeReserva, findAll, findOne, add, update, remove, authenticateAdd, testDate };