import {Request, Response, NextFunction} from 'express';
import { Mascota } from './mascota.entity.js';
import { orm } from '../shared/db/orm.js';
import { Dueno } from '../dueno/dueno.entity.js'; 
import { Especie } from '../especie/especie.entity.js';

function sanitizeMascota(req: Request, res: Response, next: NextFunction) {

  req.body.sanitizeInput = {
    idMascota: req.body.idMascota,
    nomMascota: req.body.nomMascota, //req
    edad: req.body.edad,
    sexo: req.body.sexo,
    exotico: req.body.exotico,
    descripcion: req.body.descripcion,
    especie: req.body.especie, //req
    raza: req.body.raza,
    dueno: req.body.dueno, //req
    peso: req.body.peso
  };
// arreglar el object keys
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

async function add(req: Request, res: Response) {
  console.log("Adding mascota with data:", req.body.sanitizeInput);
  try {
    authenticate(req.body.sanitizeInput, res);
    
    const mascota = em.create(Mascota, req.body.sanitizeInput);
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

}

export { sanitizeMascota, findAll, findOne, add, update, remove };

