import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { authenticate } from '../usuario/usuario.controller.js';
import { Cuidador } from './cuidador.entity.js';
import sanitizeHTML from 'sanitize-html';

const em = orm.em;

const sanitizeCuidador = (req: Request, res: Response, next: NextFunction) => {
  req.body.sanitizeInput = {
    idUsuario: req.params.idUsuario,
    email: sanitizeHTML(req.body.email),
    password: sanitizeHTML(req.body.password),
    nombre: sanitizeHTML(req.body.nombre),
    nroDocumento: sanitizeHTML(req.body.nroDocumento),
    tipoDocumento: sanitizeHTML(req.body.tipoDocumento),
    telefono: sanitizeHTML(req.body.telefono),
    telefonoEmergencia: sanitizeHTML(req.body.telefonoEmergencia),
    sexoCuidador: sanitizeHTML(req.body.sexoCuidador),
    tipoUsuario: 'cuidador'
  };
  
  Object.keys(req.body.sanitizeInput).forEach((key) => {
    console.log(req.body.sanitizeInput[key])
    if (req.body.sanitizeInput[key] === undefined || req.body.sanitizeInput[key] === '') {
      delete req.body.sanitizeInput[key];
    }
  })
  next();
};

async function authenticateCuidador(req: Request, res: Response) {
  try {
    const existingUser = await em.findOne(Usuario, { email: req.body.sanitizeInput.email });
    if (existingUser) {
      res.status(400).json({ message: 'El email ya está en uso' });
      return;
    }
    const existingDocumento = await em.findOne(Cuidador, { nroDocumento: req.body.sanitizeInput.nroDocumento });
    if (existingDocumento) {
      res.status(400).json({ message: 'El número de documento ya está en uso' });
      return;
    }
    if (req.body.sanitizeInput.password.length < 6) {
      res.status(400).json({ message: 'La contrase;a debe tener al menos 6 caracteres' });
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
    res.status(500).json({ message: "Error authenticating cuidador", error: error.message });
  }
}


async function findAll(req: Request, res: Response) {
  try {
    const cuidadores = await em.find(Cuidador, {});
    res.status(200).json({ message: 'Found all cuidadores', data: cuidadores });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving cuidadores", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const idUsuario = Number(req.params.idUsuario);
    const cuidador = await em.findOneOrFail(Cuidador, { idUsuario });
    res.status(200).json({ message: 'Cuidador found', data: cuidador });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving cuidador", error: error.message });
  }
}

async function add(req: Request, res: Response) {
   

      try {
        Object.keys(req.body.sanitizeInput).forEach((key) => { 
          if (req.body.sanitizeInput[key] === undefined) {
            res.status(400).json({ message: `El campo ${key} es requerido` });
          }
        });
        console.log("adding", req.body.sanitizeInput.nombre)
        await authenticateCuidador(req, res);
        req.body.sanitizeInput.password = await bcrypt.hash(req.body.sanitizeInput.password, 10);
        const cuidador = em.create(Cuidador, req.body.sanitizeInput);
        await em.flush();
        res.status(200).json({ message: 'cuidador created', data: cuidador });
        return;

    } catch (error: any) {
      res.status(500).json({ message: "Error creating cuidador", error: error.message });
      return;
    }
};


async function update(req: Request, res: Response) {
 
  try {
    const idUsuario = Number.parseInt(req.params.idUsuario);
    const cuidador = await em.findOneOrFail(Cuidador, { idUsuario: idUsuario });
    if (!cuidador) {
      res.status(404).json({ message: 'Cuidador not found', data: idUsuario });
      return;
    }
    em.assign(cuidador, req.body.sanitizeInput);
    await em.flush();
    res.status(200).json({ message: 'Cuidador updated', data: cuidador });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating cuidador", error: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const idUsuario = Number.parseInt(req.params.idUsuario);
    const cuidador = await em.findOneOrFail(Cuidador, { idUsuario: idUsuario });
    await em.removeAndFlush(cuidador);
    res.status(200).json({ message: 'Cuidador removed', data: cuidador });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing cuidador", error: error.message });
  }
}


export {sanitizeCuidador, findAll, findOne, add, update, remove }