import {Request, Response, NextFunction} from 'express';
import { Dueno } from './dueno.entity.js';
import { orm } from '../shared/db/orm.js';
import { authenticate } from '../usuario/usuario.controller.js';
import { Usuario } from '../usuario/usuario.entity.js';
import bcrypt from 'bcrypt';
import { Mascota } from '../mascota/mascota.entity.js';

function sanitizeDueno(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeInput = {
    idUsuario: req.body.idUsuario,
    nombre: req.body.nombre, //req
    email: req.body.email, //req
    password: req.body.password, //req
    tipoUsuario: 'dueno',
    perfilImage: req.body.perfilImage,
    nroDocumento: req.body.nroDocumento, //req
    tipoDocumento: req.body.tipoDocumento, //req
    telefono: req.body.telefono, //req
    telefonoEmergencia: req.body.telefonoEmergencia, 
    mascotas: req.body.mascotas, //req
    reservas: req.body.reservas //req
  };
  next();
}

const em = orm.em;

async function findAll(req: Request, res: Response) {
  try {
    const duenos = await em.find(Dueno, {});
    await em.populate(duenos, ['mascotas']);
    res.status(200).json({ message: 'Found all duenos', data: duenos });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving duenos", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  console.log("Finding dueno with params:", req.params.idUsuario);
  try {
    const idUsuario = Number(req.params.idUsuario);
    const dueno = await em.findOneOrFail(Dueno, { idUsuario }, { populate: ['mascotas'] });
    res.status(200).json({ message: 'Dueno found', data: dueno});
    console.log("Mascotas del dueno found:", dueno.mascotas);

  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving dueno", error: error.message });
  }
}

async function add(req: Request, res: Response) {
  console.log("Adding usuario with body:", req.body);
    const email = await em.findOne(Usuario, { email: req.body.email });
    if(!email){
      try {
        await authenticate(req.body.sanitizeInput, res);
        req.body.sanitizeInput.password = await bcrypt.hash(req.body.sanitizeInput.password, 10);
        const dueno = em.create(Dueno, req.body.sanitizeInput);
        await em.flush();
        res.status(200).json({ message: 'Dueno created', data: dueno });
        return;
        
    } catch (error: any) {
      res.status(500).json({ message: "Error creating usuario", error: error.message });
      return;
    }
    } else {
      console.log("Email already exists:", email);
      res.status(400).json({ message: 'Email already exists' });
      return;
    }
}

async function findPets(req: Request, res: Response) {
  console.log("Finding mascotas for dueno with id:", req.params.idUsuario);
  try {
    const idUsuario = Number(req.params.idUsuario);
    const dueno = await em.findOneOrFail(Dueno, { idUsuario }, { populate: ['mascotas'] });
    res.status(200).json({ message: 'Mascotas found', data: dueno.mascotas });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving mascotas", error: error.message });
  }
}


async function updateDueno(req: Request, res: Response) {
  try {
    const idUsuario = Number.parseInt(req.params.idUsuario);
    const dueno = await em.findOneOrFail(Dueno, { idUsuario });
    if (!dueno) {
      console.log("Dueno not found with id:", idUsuario);
    }
    em.assign(dueno, req.body.sanitizeInput);
    await em.flush();
    res.status(200).json({ message: 'Dueno updated', data: dueno });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating dueno", error: error.message });
  }
}

async function remove(req: Request, res: Response) {
  console.log("Removing dueno with id:", req.params.idUsuario);
  try {
    const idUsuario = Number.parseInt(req.params.idUsuario);
    const dueno = await em.findOneOrFail(Dueno, { idUsuario });
    await em.removeAndFlush(dueno);
    res.status(200).json({ message: 'Dueno removed', data: dueno });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing dueno", error: error.message });
  }
}

export { sanitizeDueno, findAll, findOne, add, updateDueno, remove, findPets };