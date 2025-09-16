import {Request, Response, NextFunction} from 'express';
import { Dueno } from './dueno.entity.js';
import { orm } from '../shared/db/orm.js';
import { authenticate } from '../usuario/usuario.controller.js';
import { Usuario } from '../usuario/usuario.entity.js';
import bcrypt from 'bcrypt';
import { Mascota } from '../mascota/mascota.entity.js';
import sanitizeHTML from 'sanitize-html';

function sanitizeDueno(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeInput = {
    idUsuario: sanitizeHTML(req.body.idUsuario),
    nombre: sanitizeHTML(req.body.nombre),
    email: sanitizeHTML(req.body.email),
    password: sanitizeHTML(req.body.password),
    tipoUsuario: 'dueno',
    perfilImage: sanitizeHTML(req.body.perfilImage),
    nroDocumento: sanitizeHTML(req.body.nroDocumento),
    tipoDocumento: sanitizeHTML(req.body.tipoDocumento),
    telefono: sanitizeHTML(req.body.telefono),
    telefonoEmergencia: sanitizeHTML(req.body.telefonoEmergencia),
    mascotas: sanitizeHTML(req.body.mascotas),
    reservas: sanitizeHTML(req.body.reservas)
  };
  Object.keys(req.body.sanitizeInput).forEach((key) => {
    console.log(req.body.sanitizeInput[key])
    if (req.body.sanitizeInput[key] === undefined || req.body.sanitizeInput[key] === '') {
      delete req.body.sanitizeInput[key];
    }
  })
  next();
}

const em = orm.em;

async function authenticateDueno(req: Request, res: Response) {
  try {
    const existingUser = await em.findOne(Usuario, { email: req.body.sanitizeInput.email });
    if (existingUser) {
      res.status(400).json({ message: 'El email ya está en uso' });
      return;
    }
    const existingDocumento = await em.findOne(Dueno, { nroDocumento: req.body.sanitizeInput.nroDocumento });
    if (existingDocumento) {
      res.status(400).json({ message: 'El número de documento ya está en uso' });
      return;
    }
    if (req.body.sanitizeInput.password.length < 6) {
      res.status(400).json({ message: 'La contrasena debe tener al menos 6 caracteres' });
      return;
    }
    if (req.body.sanitizeInput.nombre.length < 3) {
      res.status(400).json({ message: 'El nombre debe tener al menos 3 caracteres' });
      return;
    }
    if (req.body.sanitizeInput.nroDocumento.length >= 7 && req.body.sanitizeInput.nroDocumento.length <= 9) {
      res.status(400).json({ message: 'El numero de documento debe tener entre 7 y 9 caracteres' });
      return;
    }

  } catch (error: any) {
    res.status(500).json({ message: "Error authenticating dueno", error: error.message });
  }
}


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
 
    const email = await em.findOne(Usuario, { email: req.body.email });
    if(!email){
      try {
        await authenticateDueno(req, res);
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