import {Request, Response, NextFunction} from 'express';
import { Mascota } from './mascota.entity.js';
import { orm } from '../shared/db/orm.js';
import { Dueno } from '../dueno/dueno.entity.js'; 
import { Especie } from '../especie/especie.entity.js';
import { Raza } from '../raza/raza.entity.js';
import { Imagen } from '../imagen/imagenes.entity.js';
import multer from 'multer';
import path from 'path';
import sanitizeHTML from 'sanitize-html';
import fs from 'fs';

function sanitizeMascota(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeInput = {
    idMascota: sanitizeHTML(req.body.idMascota),
    nomMascota: sanitizeHTML(req.body.nomMascota), //req
    edad: parseInt(sanitizeHTML(req.body.edad)),
    sexo: sanitizeHTML(req.body.sexo),
    exotico: req.body.exotico,
    descripcion: sanitizeHTML(req.body.descripcion),
    especie: parseInt(sanitizeHTML(req.body.especie)),
    raza: req.body.raza ? parseInt(sanitizeHTML(req.body.raza)) : null,
    dueno: sanitizeHTML(req.body.dueno),
    peso: parseFloat(sanitizeHTML(req.body.peso))
  };
  Object.keys(req.body.sanitizeInput).forEach((key) => {
    console.log(req.body.sanitizeInput[key])
    if (req.body.sanitizeInput[key] === undefined || req.body.sanitizeInput[key] === '') {
      delete req.body.sanitizeInput[key];
    }
  })
  next();
};

const em = orm.em;

async function findAll(req: Request, res: Response) {
  try {
    const mascotas = await em.find(
      Mascota, 
      {}, 
      { populate: ['dueno', 'especie', 'raza', 'imagen'] }
    );
    res.status(200).json({ message: 'finded all mascotas', data: mascotas });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving mascotas", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const idMascota = Number(req.params.idMascota);
    const mascota = await em.findOneOrFail(
      Mascota, 
      { idMascota }, 
      { populate: ['dueno', 'especie', 'raza', 'imagen'] }
    );
    res.status(200).json({ message: 'Mascota found', data: mascota });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving mascota", error: error.message });
  }
}


async function add(req: Request, res: Response) {
  console.log("Adding mascota with data:", req.body.sanitizeInput);
  try {
    authenticate(req.body.sanitizeInput, res);
    console.log("Authentication passed");
    const raza = await em.findOne(Raza, { idRaza: req.body.sanitizeInput.raza, especie: req.body.sanitizeInput.especie });
    if (!raza) {
      res.status(400).json({
        message: 'Raza not found or invalid for especie',
      });
      return;
    }
    const dueno = await em.findOneOrFail(Dueno, { idUsuario: req.body.sanitizeInput.dueno });
    if (!dueno) {
      res.status(404).json({ message: 'Dueno not found', data: req.body.sanitizeInput.dueno });
      return;
    }
    const especie = await em.findOne(Especie, { idEspecie: req.body.sanitizeInput.especie });
    if (!especie) {
      res.status(404).json({ message: 'Especie not found', data: req.body.sanitizeInput.especie });
      return;
    }
    const mascota = em.create(Mascota, req.body.sanitizeInput);
    dueno.mascotas?.add(mascota);
    especie.mascotas?.add(mascota);
    await em.persistAndFlush(mascota);
    await em.populate(mascota, ['dueno', 'especie', 'raza']);
    
    res.status(201).json({ message: 'Mascota created', data: mascota });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating mascota", error: error.message });
  }
}


async function update(req: Request, res: Response) {
    try {
        const idMascota = Number(req.params.idMascota);
        const mascota = await em.findOneOrFail(
            Mascota, 
            { idMascota: idMascota },
            { populate: ['dueno', 'especie', 'raza', 'imagen'] }
        );
        em.assign(mascota, req.body);
        await em.flush();
        await em.populate(mascota, ['dueno', 'especie', 'raza', 'imagen']);
        res.status(200).json({ message: 'Mascota updated', data: mascota });
    } catch (error: any) {
        console.error("Error al actualizar la mascota:", error);
        res.status(500).json({ message: "Error updating mascota", error: error.message });
    }
}

async function findByOwner(req: Request, res: Response) {
  try {
    const idDueno = Number(req.params.id);
    console.log('Buscando mascotas para dueño ID:', idDueno);
    
    const mascotas = await em.find(
      Mascota, 
      { dueno: { idUsuario: idDueno } }, 
      { populate: ['dueno', 'especie', 'raza', 'imagen'] }
    );
    
    console.log('Mascotas encontradas:', mascotas.length);
    
    res.status(200).json({ 
      message: 'Mascotas found for owner', 
      data: mascotas    
    });
  } catch (error: any) {
    console.error('Error en findByOwner:', error);
    res.status(500).json({ 
      message: "Error retrieving mascotas for owner", 
      error: error.message 
    });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const idMascota = Number(req.params.idMascota);
    const mascota = await em.findOneOrFail(
      Mascota, 
      { idMascota },
      { populate: ['imagen'] }
    );
    
    // Eliminar imagen si existe (tanto archivo físico como registro)
    if (mascota.imagen) {
      // Eliminar archivo físico
      if (mascota.imagen.path) {
        const filename = path.basename(mascota.imagen.path);
        const filePath = path.join('public/img/perfilImages', filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      // Eliminar registro de imagen
      await em.removeAndFlush(mascota.imagen);
    }
    
    await em.removeAndFlush(mascota);
    res.status(200).json({ message: 'Mascota removed', data: mascota });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing mascota", error: error.message });
  }
}

async function authenticate(sanitizeInput: any, res: Response) {
  console.log("Sanitized input completo:", sanitizeInput);
  try {

  


    if (sanitizeInput.sexo !== 'M' && sanitizeInput.sexo !== 'F') {
    res.status(400).json({ message: 'Sexo must be M or F', data: sanitizeInput.sexo });
    return;
  }

    if ( sanitizeInput.exotico !== 'False' &&  sanitizeInput.exotico !== 'true') {
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

  } catch (error: any) {
      res.status(500).json({ message: "Error authenticating mascota", error: error.message });
      return;
  }
}

async function uploadFiles(req: Request, res: Response): Promise<void> {
  try {
    console.log('📸 STEP 1 - Iniciando uploadFiles');
    console.log('📸 req.params:', req.params);
    console.log('📸 req.file:', req.file);
    
    // STEP 1: Validaciones básicas
    if (!req.file) {
      console.log('❌ ERROR: No file uploaded');
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    
    if (!req.params.idMascota) {
      console.log('❌ ERROR: Missing idMascota parameter');
      res.status(400).json({ message: 'Missing idMascota parameter' });
      return;
    }
    
    console.log('📸 STEP 2 - Validaciones básicas OK');
    
    const idMascota = Number(req.params.idMascota);
    console.log('📸 STEP 3 - idMascota parseado:', idMascota);
    
    if (isNaN(idMascota)) {
      console.log('❌ ERROR: Invalid idMascota');
      res.status(400).json({ message: 'Invalid idMascota' });
      return;
    }
    
    // STEP 4: Buscar mascota
    console.log('📸 STEP 4 - Buscando mascota con ID:', idMascota);
    let mascota;
    try {
      mascota = await em.findOne(Mascota, { idMascota });
      console.log('📸 STEP 4.1 - Mascota encontrada:', mascota ? 'SÍ' : 'NO');
    } catch (dbError) {
      console.error('❌ ERROR en findOne Mascota:', dbError);
      throw new Error(`Database error finding mascota: ${dbError}`);
    }
    
    if (!mascota) {
      console.log('❌ ERROR: Mascota not found');
      // Eliminar archivo subido
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
      res.status(404).json({ message: 'Mascota not found' });
      return;
    }
    
    console.log('📸 STEP 5 - Mascota encontrada, buscando imagen existente');
    
    // STEP 5: Buscar imagen existente
    let imagenExistente;
    try {
      imagenExistente = await em.findOne(Imagen, { mascota: { idMascota } });
      console.log('📸 STEP 5.1 - Imagen existente:', imagenExistente ? 'SÍ' : 'NO');
    } catch (dbError) {
      console.error('❌ ERROR en findOne Imagen:', dbError);
      throw new Error(`Database error finding existing image: ${dbError}`);
    }
    
    // STEP 6: Eliminar imagen existente si la hay
    if (imagenExistente) {
      console.log('📸 STEP 6 - Eliminando imagen existente');
      try {
        // Eliminar archivo físico anterior
        if (imagenExistente.path) {
          const filename = path.basename(imagenExistente.path);
          const filePath = path.join('public/img/perfilImages', filename);
          console.log('📸 STEP 6.1 - Eliminando archivo:', filePath);
          fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting old file:', err);
          });
        }
        // Eliminar registro de la base de datos
        console.log('📸 STEP 6.2 - Eliminando registro de BD');
        await em.removeAndFlush(imagenExistente);
        console.log('📸 STEP 6.3 - Imagen existente eliminada OK');
      } catch (dbError) {
        console.error('❌ ERROR eliminando imagen existente:', dbError);
        throw new Error(`Error removing existing image: ${dbError}`);
      }
    }
    
    console.log('📸 STEP 7 - Creando nueva imagen');
    
    // STEP 7: Crear nueva imagen
    let imagen;
    try {
      imagen = new Imagen();
      const fullUrl = `${req.protocol}://${req.get('host')}/img/perfilImages/${req.file.filename}`;
      console.log('📸 STEP 7.1 - URL generada:', fullUrl);
      
      imagen.path = fullUrl;
      imagen.mascota = mascota;
      
      console.log('📸 STEP 7.2 - Guardando imagen en BD');
      await em.persistAndFlush(imagen);
      console.log('📸 STEP 7.3 - Imagen guardada OK');
      
    } catch (dbError) {
      console.error('❌ ERROR creando/guardando imagen:', dbError);
      throw new Error(`Error creating new image: ${dbError}`);
    }
    
    console.log('📸 STEP 8 - Actualizando mascota fotoPerfil');
    
    // STEP 8: Actualizar fotoPerfil en mascota
    try {
      mascota.fotoPerfil = imagen.path;
      await em.persistAndFlush(mascota);
      console.log('📸 STEP 8.1 - Mascota actualizada OK');
    } catch (dbError) {
      console.error('❌ ERROR actualizando mascota:', dbError);
      // No lanzar error aquí porque la imagen ya se guardó
      console.log('⚠️  WARNING: Imagen guardada pero no se pudo actualizar fotoPerfil');
    }
    
    console.log('📸 STEP 9 - Proceso completado exitosamente');
    
    res.status(201).json({ 
      message: 'Imagen uploaded successfully', 
      data: {
        imagen: {
          idImagen: imagen.idImagen,
          path: imagen.path
        },
        mascota: {
          idMascota: mascota.idMascota,
          nomMascota: mascota.nomMascota,
          fotoPerfil: mascota.fotoPerfil
        }
      }
    });
    
  } catch (error: any) {
    console.error('💥 ERROR CRÍTICO en uploadFiles:', error);
    console.error('💥 Error stack:', error.stack);
    console.error('💥 Error message:', error.message);
    
    // Eliminar archivo subido en caso de error
    if (req.file) {
      console.log('🧹 Limpiando archivo subido debido al error');
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting uploaded file:", unlinkErr);
      });
    }
    
    res.status(500).json({ 
      message: "Error interno al procesar la imagen", 
      error: error.message,
      step: 'Ver logs del servidor para detalles'
    });
  }
}




export { sanitizeMascota, findAll, findOne, findByOwner, add, update, remove, uploadFiles };