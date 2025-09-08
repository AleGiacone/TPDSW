import {Request, Response, NextFunction} from 'express';
import { Mascota } from './mascota.entity.js';
import { orm } from '../shared/db/orm.js';
import { Dueno } from '../dueno/dueno.entity.js'; 
import { Especie } from '../especie/especie.entity.js';
import { Raza } from '../raza/raza.entity.js'
import multer from 'multer';
import path from 'path';

function sanitizeMascota(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeInput = {
    idMascota: req.body.idMascota,
    nomMascota: req.body.nomMascota, // string
    edad: parseInt(req.body.edad), // number
    sexo: req.body.sexo, // string
    exotico: req.body.exotico === true || req.body.exotico === 'true', // boolean
    descripcion: req.body.descripcion, // string
    especie: parseInt(req.body.especie), // para la relación ManyToOne
    raza: req.body.raza ? parseInt(req.body.raza) : null, // para la relación ManyToOne
    dueno: parseInt(req.body.dueno), // para la relación ManyToOne
    peso: parseFloat(req.body.peso) // number
  };
  
  next();
} 
// arreglar el object keys
 
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
    await authenticate(req.body.sanitizeInput, res);
    
    const mascota = em.create(Mascota, req.body.sanitizeInput);
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
            { populate: ['dueno', 'especie', 'raza'] }
        );
        em.assign(mascota, req.body);
        await em.flush();
        await em.populate(mascota, ['dueno', 'especie', 'raza']);
        res.status(200).json({ message: 'Mascota updated', data: mascota });
    } catch (error: any) {
        console.error("Error al actualizar la mascota:", error);
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
  console.log("Sanitized input completo:", sanitizeInput);
  console.log("Especie ID a buscar:", sanitizeInput.especie, typeof sanitizeInput.especie);
  console.log("Raza ID a buscar:", sanitizeInput.raza, typeof sanitizeInput.raza);
  
  const especie = await em.findOne(Especie, { idEspecie: sanitizeInput.especie });
  console.log("Especie encontrada:", especie);
  
  if (!especie) {
    res.status(404).json({ 
      message: 'Especie not found', 
      data: { especieId: sanitizeInput.especie }
    });
    throw new Error('Especie not found');
  }
  if (sanitizeInput.raza) {
    console.log("🔍 Buscando raza...");
    const razaConEspecie = await em.findOne(Raza, { 
      idRaza: sanitizeInput.raza 
    }, { populate: ['especie'] });
    
    console.log("Raza encontrada (con populate):", razaConEspecie);
    
    if (razaConEspecie) {
      console.log("Especie de la raza:", razaConEspecie.especie);
      console.log("ID de especie de la raza:", razaConEspecie.especie?.idEspecie);
    }
    
    const raza = await em.findOne(Raza, { 
      idRaza: sanitizeInput.raza,
      especie: { idEspecie: sanitizeInput.especie }
    });
    
    console.log("Raza con filtro de especie:", raza);
    
    if (!raza) {
      const razasDeEspecie = await em.find(Raza, { 
        especie: { idEspecie: sanitizeInput.especie }
      }, { populate: ['especie'] });
      
      console.log(`Razas disponibles para especie ${sanitizeInput.especie}:`, razasDeEspecie);
      
      res.status(404).json({ 
        message: 'Raza not found or does not belong to the specified especie', 
        data: { 
          razaId: sanitizeInput.raza, 
          especieId: sanitizeInput.especie,
          razasDisponibles: razasDeEspecie.map(r => ({
            id: r.idRaza,
            nombre: r.nomRaza
          }))
        }
      });
      throw new Error('Raza not found or invalid for especie');
    }
  }
  const dueno = await em.findOne(Dueno, { idUsuario: sanitizeInput.dueno });
  console.log("Dueño encontrado:", dueno);
  
  if (!dueno) {
    res.status(404).json({ 
      message: 'Dueno not found', 
      data: { duenoId: sanitizeInput.dueno }
    });
    throw new Error('Dueno not found');
  }
}

async function findByOwner(req: Request, res: Response) {
  try {
    const idDueno = Number(req.params.id);
    console.log('Buscando mascotas para dueño ID:', idDueno);
    
    const mascotas = await em.find(
      Mascota, 
      { dueno: { idUsuario: idDueno } }, 
      { populate: ['dueno', 'especie', 'raza'] }
    );
    
    console.log('Mascotas encontradas:', mascotas.length);
    console.log('Datos de mascotas:', mascotas);
    
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

export { sanitizeMascota, findAll, findOne, findByOwner, add, update, remove, uploadFiles};

