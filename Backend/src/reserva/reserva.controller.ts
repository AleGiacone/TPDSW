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
import { DiaReservado } from "./diaReservado.entity.js";
import { Collection } from "mongoose";

// PONER SANITIZE HTML EN TODOS LOS CAMPOS
function sanitizeReserva(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizeInput = {
    idReserva: req.body.idReserva,
    fechaReserva: req.body.fechaReserva,

    descripcion: req.body.descripcion,
    horaReserva: req.body.horaReserva,
    idDueno: req.body.idDueno,
    idMascotas: req.body.idMascotas,
    idPublicacion: req.body.idPublicacion,
    dias: req.body.dias,
  };
  Object.keys(req.body.sanitizeInput).forEach((key) => {
    if (req.body.sanitizeInput[key] === undefined) {
      delete req.body.sanitizeInput[key];
    }
  });

  if (req.body.sanitizeInput.dias != null && req.body.sanitizeInput.dias != undefined) {
    try {
      for (let dias of req.body.sanitizeInput.dias) {
        console.log("Sanitizing date:", dias);
        Temporal.PlainDate.from(dias);
      }
    } catch (error) {
      res.status(400).json({ message: "Error parsing dates", error: error });
      return;
    }
  }
  next();
}

const em = orm.em;

async function findAll(req: Request, res: Response) {
  try {
    const reservas = await em.find(Reserva, {}, { populate: ["dueno", "mascotas", "diasReservados"] });
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


// Función para verificar si las fechas están disponibles. Esta a parte para no molestar con los nombres 
async function verifyDate(req: Request, res: Response, next: NextFunction) {
  try {

    
    const dias: Temporal.PlainDate[] = [];
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion: req.body.sanitizeInput.idPublicacion }, { populate: ['reservas'] });

    const reservasDeLaPublicacion = await em.find(Reserva, { publicacion:  publicacion }, { populate: ['diasReservados'] });
    
    const diasReservados = reservasDeLaPublicacion.map(r => r.diasReservados.getItems().map(d => d.fechaReservada)).flat();

    console.log("Dias ya reservados en la publicacion:", diasReservados);

    for (let dia of req.body.sanitizeInput.dias) {
      console.log("Procesando dia:", Temporal.PlainDate.from(dia).toString());
      if (diasReservados.includes(Temporal.PlainDate.from(dia).toString())) {
        res.status(400).json({ message: `La fecha ${Temporal.PlainDate.from(dia).toString()} ya está reservada en la publicación.`});
        return;
      }
    }
  } catch (error: any) {
    res.status(500).json({ message: "Error verifying dates", error: error.message });
  }
  next();
}



async function add(req: Request, res: Response) {
  try {

    const reserva = em.create(Reserva, req.body.sanitizeInput);
    console.log("Agregar dias reservados")
    //Agregar dias reservados
    req.body.sanitizeInput.dias.forEach( async (dia: any) => {
      const diaReservado = em.create(DiaReservado, { fechaReservada: dia, reserva: reserva }, );
      reserva.diasReservados.add(diaReservado);
    })

    console.log("Agregar dias mascotas")
    //Agregar mascotas
    req.body.sanitizeInput.idMascotas.forEach( async (idMascota: number) => {
      const mascota = await em.findOneOrFail(Mascota, { idMascota: idMascota, dueno: req.body.sanitizeInput.idDueno });
      reserva.mascotas.add(mascota);
    })
  
    console.log("Agregar dias publicacion")
    //Agregar publicacion
    const publi = await em.findOneOrFail(Publicacion, { idPublicacion: req.body.sanitizeInput.idPublicacion });
    reserva.publicacion = publi;
    publi.reservas.add(reserva)

    console.log("Agregar dias dueno")
    //Agregar dueno
    const dueno = await em.findOneOrFail(Dueno, { idUsuario: req.body.sanitizeInput.idDueno }, { populate: ['mascotas','reservas'] });
    reserva.dueno = dueno;
    console.log("Adding reserva with data:", reserva);

    console.log("Finalizando reserva");
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

    // Verificar que no exista una reserva en las mismas fechas para la misma publicacion
    // const reservaExistente = await em.findOne(Reserva, {fechaDesde: req.body.sanitizeInput.fechaDesde, publicacion: req.body.sanitizeInput.idPublicacion});
    // if(reservaExistente) {
    //   res.status(400).json({ message: "Ya existe una reserva para esa publicacion en esa fecha"})
    // }
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
  try {
    const dias = [];
    req.body.sanitizeInput.dias.forEach( async (dia: any) => {
      const fecha = Temporal.PlainDate.from(dia);
      dias.push(fecha);
    });
    req.body.sanitizeInput.dias.forEach( async (dia: any) => {
      console.log("Fecha procesada:", dia.toString());
    });
    console.log("Received dates:", req.body.sanitizeInput.dias);
    console.log("Comparing dates:", req.body.sanitizeInput.dias[0], "and", req.body.sanitizeInput.dias[1]);

    if (req.body.sanitizeInput.dias[0] > req.body.sanitizeInput.dias[1]) {
      console.log("Fecha desde es mayor que fecha hasta");
    }
  } catch (error: any) {
    res.status(500).json({ message: "Error testing dates", error: error.message });
  }
}




export { sanitizeReserva, findAll, findOne, add, update, remove, authenticateAdd, testDate, verifyDate };