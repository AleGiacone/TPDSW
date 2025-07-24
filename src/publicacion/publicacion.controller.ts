import {Request, Response, NextFunction} from 'express';
import { orm } from '../shared/db/orm.js';
import { Publicacion } from './publicacion.entity.js';

function sanitizePublicacion(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeInput = {
    idCuidador: req.body.idCuidador,
    titulo: req.body.titulo,
    descripcion: req.body.descripcion,
    precio: req.body.precio,
    fechaPublicacion: new Date(),
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
    const publicaciones = await em.find(Publicacion, {}, { populate: ['reservas'] });
    res.status(200).json({ message: 'Found all publicaciones', data: publicaciones });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving publicaciones", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  console.log("Adding publicacion with body:", req.body);
  try {
    const idPublicacion = Number(req.params.idPublicacion);
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion }, { populate: ['reservas'] });
    res.status(200).json({ message: 'Publicacion found', data: publicacion });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving publicacion", error: error.message });
  }
}

async function add(req: Request, res: Response) {

  console.log("Adding publicacion with body:", req.body);
  try {
    if(req.session) {
      req.body.sanitizeInput.idCuidador = req.session.usuario.idUsuario
    }
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
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion });
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
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion });
    await em.removeAndFlush(publicacion);
    res.status(200).json({ message: 'Publicacion removed', data: publicacion });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing publicacion", error: error.message });
  }
}

export { sanitizePublicacion, findAll, findOne, add, update, remove };