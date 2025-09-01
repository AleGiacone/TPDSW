import { Request, Response, NextFunction } from 'express';
import { Imagen }  from './imagenes.entity.js';
import { orm } from '../shared/db/orm.js';
import multer from 'multer';
import path from 'path';

const em = orm.em;



async function add(req: Request, res: Response) {
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
  try {
    const imagen = new Imagen();
    if (req.file === undefined) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    if( req.body.idUsuario != null) {
      imagen.usuario = req.body.idUsuario;
    } else if ( req.body.idPublicacion != null) {
        imagen.publicacion = req.body.idPublicacion;
      } else {
          imagen.mascota = req.body.idMascota;
    }
    imagen.path = '/img/perfilImages/' + req.file.filename;
    await em.persistAndFlush(imagen);
    res.status(201).json({ message: 'Imagen added', data: imagen });
  } catch (error: any) {
    res.status(500).json({ message: "Error adding imagen", error: error.message });
  }
}

async function findAll(req: Request, res: Response) {
  try {
    if( req.body.idUsuario != null) {
      const imagen = await em.find(Imagen, { usuario: req.body.idUsuario });
      res.status(200).json({ message: 'Found image', data: imagen });
    } else if ( req.body.idPublicacion != null) {
      const imagenes = await em.find(Imagen, { publicacion: req.body.idPublicacion });
      res.status(200).json({ message: 'Found image', data: imagenes });
    } else {
      const imagen = await em.find(Imagen, { mascota: req.body.idMascota });
      res.status(200).json({ message: 'Found image', data: imagen});
    }

  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving imagenes", error: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const idImagen = Number(req.params.idImagen);
    const imagen = await em.findOneOrFail(Imagen, { idImagen });
    await em.removeAndFlush(imagen);
    res.status(200).json({ message: 'Imagen removed', data: imagen });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing imagen", error: error.message });
  }
}

async function update(req: Request, res: Response)  {
  try {
    const idImagen = Number(req.params.idImagen);
    const imagen = await em.findOneOrFail(Imagen, { idImagen });
    imagen.path = req.body.path || imagen.path;
    await em.persistAndFlush(imagen);
    res.status(200).json({ message: 'Imagen updated', data: imagen });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating imagen", error: error.message });
  }
}

export { add, findAll, remove, update };