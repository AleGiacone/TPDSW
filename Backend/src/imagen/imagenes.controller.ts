import { Request, Response, NextFunction} from 'express';
import { Imagen }  from './imagenes.entity.js';
import { orm } from '../shared/db/orm.js';
import { Mascota } from '../mascota/mascota.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Publicacion } from '../publicacion/publicacion.entity.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const em = orm.em;

// Reemplaza tu función add completa con esta:
async function add(req: Request, res: Response): Promise<void> {
 try {
  const imagen = new Imagen();
  if (!req.file) {
   res.status(400).json({ message: 'No file uploaded' });
   return;
  }
  
  // Aquí se construye la URL completa
  const fullUrl = `${req.protocol}://${req.get('host')}/img/perfilImages/${req.file.filename}`;
  imagen.path = fullUrl;
  
  // Asignar relaciones basadas en el cuerpo de la solicitud
  if (req.body.idUsuario != null) {
   const usuario = await em.findOne(Usuario, { idUsuario: parseInt(req.body.idUsuario) });
   if (usuario) {
    imagen.usuario = usuario;
   }
  } else if (req.body.idPublicacion != null) {
   const publicacion = await em.findOne(Publicacion, { idPublicacion: parseInt(req.body.idPublicacion) });
   if (publicacion) {
    imagen.publicacion = publicacion;
   }
  } else if (req.body.idMascota != null) {
   const mascota = await em.findOne(Mascota, { idMascota: parseInt(req.body.idMascota) });
   if (mascota) {
    imagen.mascota = mascota;
   } else {
    res.status(404).json({ message: 'Mascota not found' });
    return;
   }
  }
  
  await em.persistAndFlush(imagen);
  res.status(201).json({ message: 'Imagen added', data: imagen });
 } catch (error: any) {
  console.error('Error completo en add imagen:', error);
  // Si hay un error, el archivo ya ha sido subido por multer, 
  // por lo que debes eliminarlo manualmente
  if (req.file) {
   fs.unlink(req.file.path, (unlinkErr) => {
    if (unlinkErr) console.error("Error deleting uploaded file:", unlinkErr);
   });
  }
  res.status(500).json({ message: "Error adding imagen", error: error.message });
 }
}

async function findAll(req: Request, res: Response): Promise<void> {
  try {
    if( req.body.idUsuario != null) {
      const imagen = await em.find(Imagen, { usuario: { idUsuario: parseInt(req.body.idUsuario) } });
      res.status(200).json({ message: 'Found image', data: imagen });
    } else if ( req.body.idPublicacion != null) {
      const imagenes = await em.find(Imagen, { publicacion: { idPublicacion: parseInt(req.body.idPublicacion) } });
      res.status(200).json({ message: 'Found image', data: imagenes });
    } else if (req.body.idMascota != null) {
      const imagen = await em.find(Imagen, { mascota: { idMascota: parseInt(req.body.idMascota) } });
      res.status(200).json({ message: 'Found image', data: imagen});
    } else {
      res.status(400).json({ message: 'Missing required ID parameter' });
    }
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving imagenes", error: error.message });
  }
}

async function remove(req: Request, res: Response): Promise<void> {
  try {
    const idImagen = Number(req.params.idImagen);
    const imagen = await em.findOneOrFail(Imagen, { idImagen });
    
    // Eliminar archivo físico si existe
    if (imagen.path) {
      const filename = path.basename(imagen.path);
      const filePath = path.join('public/img/perfilImages', filename);
      
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    await em.removeAndFlush(imagen);
    res.status(200).json({ message: 'Imagen removed', data: imagen });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing imagen", error: error.message });
  }
}

async function update(req: Request, res: Response): Promise<void> {
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

// Nueva función para eliminar imagen de mascota específicamente
async function removeMascotaImage(req: Request, res: Response): Promise<void> {
  try {
    const idMascota = Number(req.params.idMascota);
    
    // Buscar imagen asociada a la mascota
    const imagen = await em.findOne(Imagen, { mascota: { idMascota: idMascota } });
    
    if (!imagen) {
      res.status(404).json({ message: 'No image found for this mascota' });
      return;
    }
    
    // Eliminar archivo físico si existe
    if (imagen.path) {
      const filename = path.basename(imagen.path);
      const filePath = path.join('public/img/perfilImages', filename);
      
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    // También limpiar el campo fotoPerfil de la mascota
    const mascota = await em.findOne(Mascota, { idMascota });
    if (mascota) {
      mascota.fotoPerfil = undefined;
      await em.persistAndFlush(mascota);
    }
    
    await em.removeAndFlush(imagen);
    res.status(200).json({ message: 'Mascota image removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing mascota image", error: error.message });
  }
}

export { add, findAll, remove, update, removeMascotaImage };