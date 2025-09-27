import {Request, Response, NextFunction} from 'express';
import { orm } from '../shared/db/orm.js';
import { Publicacion } from './publicacion.entity.js';
import path from 'path/win32';
import multer from 'multer';
import { Imagen }  from '../imagen/imagenes.entity.js';
import sanitizeHTML from 'sanitize-html'

function sanitizePublicacion(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeInput = {
    idCuidador: sanitizeHTML(req.body.idCuidador),
    titulo: sanitizeHTML(req.body.titulo),
    descripcion: sanitizeHTML(req.body.descripcion),
    precio: sanitizeHTML(req.body.precio),
    fechaPublicacion: new Date(),
  };
    Object.keys(req.body.sanitizeInput).forEach((key) => {
    console.log(req.body.sanitizeInput[key])
    if (req.body.sanitizeInput[key] === undefined || req.body.sanitizeInput[key] === '') {
      delete req.body.sanitizeInput[key];
    }
  });
  next();
}

const em = orm.em;

async function authenticatePublicacion(req: Request, res: Response) {
  if(req.body.sanitizeInput.titulo <= 3 || req.body.sanitizeInput.descripcion <= 10 || req.body.sanitizeInput.precio <= 0){
    res.status(400).json({ message: "Datos invalidos" });
    return;
  }
}


async function findAll(req: Request, res: Response) {
  try {
    const publicaciones = await em.find(Publicacion, {}, { populate: ['reservas', 'imagenes'],  });
    await em.populate(publicaciones, ['idCuidador']);
    res.status(200).json({ message: 'Found all publicaciones', data: publicaciones });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving publicaciones", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  console.log("Adding publicacion with body:", req.body);
  try {
    const idPublicacion = Number(req.params.idPublicacion);
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion }, { populate: ['reservas', 'imagenes','idCuidador'] });
    res.status(200).json({ message: 'Publicacion found', data: publicacion });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving publicacion", error: error.message });
  }
}

async function add(req: Request, res: Response) {

  authenticatePublicacion(req, res);
  try {
    
    req.body.sanitizeInput.precio = Number(req.body.sanitizeInput.precio);
    const publicacion = em.create(Publicacion, req.body.sanitizeInput);
    await em.flush();
    res.status(200).json({ message: 'Publicacion created', data: publicacion });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating publicacion", error: error.message });
  }
}

async function update(req: Request, res: Response) {
  
  try {
    const idPublicacion = Number.parseInt(req.params.idPublicacion);
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion }, { populate: ['reservas', 'imagenes'] });
    em.assign(publicacion, req.body.sanitizeInput);
    await em.flush();
    res.status(200).json({ message: 'Publicacion updated', data: publicacion });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating publicacion", error: error.message });
  }
}

async function remove(req: Request, res: Response) { 
  try {
    const idPublicacion = Number.parseInt(req.params.idPublicacion);
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion }, { populate: ['reservas', 'imagenes'] });
    await em.removeAndFlush(publicacion);
    res.status(200).json({ message: 'Publicacion removed', data: publicacion });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing publicacion", error: error.message });
  }
}



export { sanitizePublicacion, findAll, findOne, add, update, remove };