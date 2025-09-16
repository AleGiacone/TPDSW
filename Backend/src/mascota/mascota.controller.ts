import {Request, Response, NextFunction} from 'express';
import { Mascota } from './mascota.entity.js';
import { orm } from '../shared/db/orm.js';
import { Dueno } from '../dueno/dueno.entity.js'; 
import { Especie } from '../especie/especie.entity.js';
import multer from 'multer';
import path from 'path';
import sanitizeHTML from 'sanitize-html';

function sanitizeMascota(req: Request, res: Response, next: NextFunction) {

  req.body.sanitizeInput = {
    idMascota: req.body.idMascota,
    nomMascota: sanitizeHTML(req.body.nomMascota), //req
    edad: sanitizeHTML(req.body.edad),
    sexo: sanitizeHTML(req.body.sexo),
    exotico: sanitizeHTML(req.body.exotico),
    descripcion: sanitizeHTML(req.body.descripcion),
    especie: sanitizeHTML(req.body.especie),
    raza: sanitizeHTML(req.body.raza),
    dueno: sanitizeHTML(req.body.dueno),
    peso: sanitizeHTML(req.body.peso)
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

async function findAll(req: Request, res: Response) {
  try {
    const mascotas = await em.find(Mascota, {}, { populate: ['dueno', 'especie'] });
    res.status(200).json({ message: 'finded all mascotas', data: mascotas });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving mascotas", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const idMascota = Number(req.params.idMascota);
    const mascota = await em.findOneOrFail(Mascota, { idMascota }, { populate: ['dueno', 'especie'] });
    res.status(200).json({ message: 'Mascota found', data: mascota });
    console.log("Mascota found:", mascota.dueno);
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving mascota", error: error.message });
  }
}

async function uploadFiles(req: Request, res: Response) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/img/perfilImages');
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now().toString(16) + path.extname(file.originalname);
      cb(null, uniqueName);
    }
  });
  console.log("Files uploaded:", req);
  console.log("Uploading files with body:", req.body);

  if(!req.file) {
    console.log("No file uploaded");
    return;
  }
  console.log("Files uploaded:", req.file.path);
  if (!req.session) {
    console.log("Session not found");
    return;
  } else {
    console.log("Session found:", req.session.usuario);
    const emFork = em.fork();
      try {
        if (!req.file) {
          res.status(400).json({ message: 'No file uploaded' });
          return;
        }
        const mascota = await emFork.findOneOrFail(Mascota, { idMascota: req.session.usuario.idMascota })
        console.log("Found mascota for upload:", mascota);
        mascota.fotoPerfil = '/img/perfilImages/' + req.file.filename;
        await emFork.flush();

      } catch (error) {
        console.log("Error during file upload:", error);
        return;
      }
    }
}

async function add(req: Request, res: Response) {
  console.log("Adding mascota with data:", req.body.sanitizeInput);
  try {
    authenticate(req.body.sanitizeInput, res);
    const dueno = await em.findOneOrFail(Dueno, { idUsuario: req.body.sanitizeInput.dueno });
    const especie = await em.findOneOrFail(Especie, { idEspecie: req.body.sanitizeInput.especie });
    const mascota = em.create(Mascota, req.body.sanitizeInput);
    dueno.mascotas?.add(mascota);
    especie.mascotas?.add(mascota);
    await em.persistAndFlush(mascota);
    
    res.status(200).json({ message: 'Mascota created', data: mascota });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating mascota", error: error.message });
  }
}


async function update(req: Request, res: Response) {
  console.log("Updating mascota with data:", req.body.idMascota);
  try {
    const idMascota = Number(req.params.idMascota);
    const mascota = await em.findOneOrFail(Mascota, { idMascota: idMascota});
    em.assign(mascota, req.body.sanitizeInput);
    await em.flush();
    res.status(200).json({ message: 'Mascota updated', data: mascota });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating mascota", error: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const idMascota = Number(req.params.idMascota);
    const mascota = await em.findOneOrFail(Mascota, { idMascota });
    await em.removeAndFlush(mascota);
    res.status(200).json({ message: 'Mascota removed', data: mascota });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing mascota", error: error.message });
  }
}

async function authenticate(sanitizeInput: any, res: Response) {
  console.log("Authenticating with input:", sanitizeInput);
  const especie = await em.findOne(Especie, { idEspecie: sanitizeInput.especie });
  if (!especie) {
    res.status(404).json({ message: 'Especie not found', data: sanitizeInput.especie });
    return;
  }
  const dueno = await em.findOneOrFail(Dueno, { idUsuario: sanitizeInput.dueno });
  if (!dueno) {
    res.status(404).json({ message: 'Dueno not found' , data: sanitizeInput.dueno });
    return;
  }

  if (sanitizeInput.sexo !== 'M' && sanitizeInput.sexo !== 'F') {
    res.status(400).json({ message: 'Sexo must be M or F', data: sanitizeInput.sexo });
    return;
  }

  if (typeof sanitizeInput.exotico !== 'boolean') {
    res.status(400).json({ message: 'Exotico must be boolean', data: sanitizeInput.exotico });
    return;
  }

  if (sanitizeInput.edad < 0) {
    res.status(400).json({ message: 'La edad tiene que ser mayor a 0', data: sanitizeInput.edad });
    return;
  }

  if (sanitizeInput.peso < 0) {
    res.status(400).json({ message: 'El peso tiene que ser mayor a 0', data: sanitizeInput.peso });
    return;
  }
}

export { sanitizeMascota, findAll, findOne, add, update, remove, uploadFiles};

