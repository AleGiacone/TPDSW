import { Request, Response, NextFunction } from 'express';
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
  let exoticoValue = false;
  if (req.body.exotico === true || req.body.exotico === 'true' || req.body.exotico === 1 || req.body.exotico === '1') {
    exoticoValue = true;
  }

  req.body.sanitizeInput = {
    idMascota: sanitizeHTML(req.body.idMascota),
    nomMascota: sanitizeHTML(req.body.nomMascota),
    edad: sanitizeHTML(req.body.edad.toString()), // ✅ FIX: Mantener como STRING
    sexo: sanitizeHTML(req.body.sexo),
    exotico: exoticoValue,
    descripcion: sanitizeHTML(req.body.descripcion),
    especie: parseInt(sanitizeHTML(req.body.especie)),
    raza: req.body.raza ? parseInt(sanitizeHTML(req.body.raza)) : null,
    dueno: sanitizeHTML(req.body.dueno),
    peso: parseFloat(sanitizeHTML(req.body.peso))
  };

  Object.keys(req.body.sanitizeInput).forEach((key) => {
    if (req.body.sanitizeInput[key] === undefined || req.body.sanitizeInput[key] === '') {
      delete req.body.sanitizeInput[key];
    }
  })
  next();
};


async function findAll(req: Request, res: Response) {
  try {
    const em = orm.em.fork();

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
    const em = orm.em.fork();

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

// ============================================================================
// FUNCIÓN CORREGIDA - authenticate ahora retorna un objeto con el resultado
// ============================================================================
function validateMascotaData(sanitizeInput: any): { valid: boolean; error?: string } {
  if (sanitizeInput.sexo !== 'M' && sanitizeInput.sexo !== 'F') {
    return { valid: false, error: 'Sexo must be M or F' };
  }

  if (typeof sanitizeInput.exotico !== 'boolean') {
    return { valid: false, error: 'Exotico must be boolean' };
  }

  if (sanitizeInput.edad < 0) {
    return { valid: false, error: 'La edad tiene que ser mayor a 0' };
  }

  if (sanitizeInput.peso < 0) {
    return { valid: false, error: 'El peso tiene que ser mayor a 0' };
  }

  return { valid: true };
}

// ============================================================================
// FUNCIÓN add() CORREGIDA
// ============================================================================
async function add(req: Request, res: Response) {
  try {
    const em = orm.em.fork();

    // 1. Validar datos de entrada
    const validation = validateMascotaData(req.body.sanitizeInput);
    if (!validation.valid) {
      res.status(400).json({ message: validation.error });
      return; // ← AHORA SÍ RETORNA Y DETIENE LA EJECUCIÓN
    }

    // 2. Validar dueño
    const dueno = await em.findOne(Dueno, { idUsuario: req.body.sanitizeInput.dueno });
    if (!dueno) {
      res.status(404).json({
        message: 'Dueno not found',
        data: req.body.sanitizeInput.dueno
      });
      return;
    }

    // 3. Validar especie
    const especie = await em.findOne(Especie, { idEspecie: req.body.sanitizeInput.especie });
    if (!especie) {
      res.status(404).json({
        message: 'Especie not found',
        data: req.body.sanitizeInput.especie
      });
      return;
    }

    // 4. Validar raza SOLO si se proporciona
    if (req.body.sanitizeInput.raza && !isNaN(req.body.sanitizeInput.raza)) {
      const raza = await em.findOne(Raza, {
        idRaza: req.body.sanitizeInput.raza,
        especie: req.body.sanitizeInput.especie
      });

      if (!raza) {
        res.status(400).json({
          message: 'Raza not found or does not belong to the selected especie',
          details: {
            razaId: req.body.sanitizeInput.raza,
            especieId: req.body.sanitizeInput.especie
          }
        });
        return;
      }
    } else {
      // Si no hay raza válida, setear a null
      req.body.sanitizeInput.raza = null;
    }

    // 5. Crear mascota (todas las validaciones pasaron)
    const mascota = em.create(Mascota, req.body.sanitizeInput);

    // 6. Agregar relaciones
    dueno.mascotas?.add(mascota);
    especie.mascotas?.add(mascota);

    // 7. Persistir
    await em.persistAndFlush(mascota);
    await em.populate(mascota, ['dueno', 'especie', 'raza']);

    res.status(201).json({ message: 'Mascota created', data: mascota });

  } catch (error: any) {
    console.error('Error creating mascota:', error);
    res.status(500).json({
      message: "Error creating mascota",
      error: error.message
    });
  }
}

async function update(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    console.log("Updating mascota with data:", req.body.sanitizeInput);
    const idMascota = Number(req.params.idMascota);
    console.log("Parsed idMascota:", idMascota);
    const raza = req.body.sanitizeInput.raza ? parseInt(req.body.sanitizeInput.raza) : null;
    if (raza) {
      const razaEntity = await em.findOne(Raza, { idRaza: raza });
      if (!razaEntity) {
        res.status(404).json({ message: 'Raza not found' });
        return;
      }
    }
    const especie = await em.findOne(Especie, { idEspecie: req.body.sanitizeInput.especie });
    if (!especie) {
      res.status(404).json({ message: 'Especie not found' });
      return;
    }

    const mascota = await em.findOneOrFail(
      Mascota,
      { idMascota: idMascota },
      { populate: ['dueno', 'especie', 'raza', 'imagen'] }
    );
    console.log("Mascota found for update:", mascota);
    em.assign(mascota, req.body.sanitizeInput);
    await em.flush();
    await em.populate(mascota, ['dueno', 'especie', 'raza', 'imagen']);
    res.status(200).json({ message: 'Mascota updated', data: mascota });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating mascota", error: error.message });
  }
}

async function findByOwner(req: Request, res: Response) {
  try {
    const em = orm.em.fork();

    const idDueno = Number(req.params.id);
    
    const mascotas = await em.find(
      Mascota,
      { dueno: { idUsuario: idDueno } },
      { populate: ['dueno', 'especie', 'raza', 'imagen'] }
    );

    res.status(200).json({
      message: 'Mascotas found for owner',
      data: mascotas
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error retrieving mascotas for owner",
      error: error.message
    });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const em = orm.em.fork();

    const idMascota = Number(req.params.idMascota);
    const mascota = await em.findOneOrFail(
      Mascota,
      { idMascota },
      { populate: ['imagen'] }
    );

    if (mascota.imagen) {
      if (mascota.imagen.path) {
        const filename = path.basename(mascota.imagen.path);
        const filePath = path.join('public/img/perfilImages', filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      await em.removeAndFlush(mascota.imagen);
    }

    await em.removeAndFlush(mascota);
    res.status(200).json({ message: 'Mascota removed', data: mascota });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing mascota", error: error.message });
  }
}

// ============================================================================
// FUNCIÓN authenticate DEPRECADA - Ahora usa validateMascotaData
// Mantenida solo por compatibilidad con otras partes del código
// ============================================================================
async function authenticate(sanitizeInput: any, res: Response) {
  const validation = validateMascotaData(sanitizeInput);
  if (!validation.valid) {
    res.status(400).json({ message: validation.error });
  }
}

async function uploadFiles(req: Request, res: Response): Promise<void> {
  try {

    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    if (!req.params.idMascota) {
      res.status(400).json({ message: 'Missing idMascota parameter' });
      return;
    }

    const idMascota = Number(req.params.idMascota);

    if (isNaN(idMascota)) {
      res.status(400).json({ message: 'Invalid idMascota' });
      return;
    }

    const emFork = orm.em.fork();

    let mascota;
    try {
      mascota = await emFork.findOne(Mascota, { idMascota });
    } catch (dbError: any) {
      throw new Error(`Database error finding mascota: ${dbError.message}`);
    }

    if (!mascota) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
      res.status(404).json({ message: 'Mascota not found' });
      return;
    }

    let imagenExistente;
    try {
      imagenExistente = await emFork.findOne(Imagen, { mascota: { idMascota } });
    } catch (dbError: any) {
      console.error('Error finding existing image:', dbError);
    }

    if (imagenExistente) {
      try {
        if (imagenExistente.path) {
          const filename = path.basename(imagenExistente.path);
          const filePath = path.join('public/img/perfilImages', filename);

          try {
            await fs.promises.unlink(filePath);
          } catch (fsError: any) {
            console.error('Warning: Error deleting physical file:', fsError.message);
          }
        }

        await emFork.removeAndFlush(imagenExistente);
      } catch (dbError: any) {
        console.error('Error deleting existing image:', dbError);
      }
    }

    let imagen;
    try {
      imagen = new Imagen();
      imagen.path = `${req.protocol}://${req.get('host')}/img/perfilImages/${req.file.filename}`;
      imagen.mascota = mascota;

      await emFork.persistAndFlush(imagen);

    } catch (dbError: any) {
      throw new Error(`Error creating new image: ${dbError.message}`);
    }

    try {
      mascota.fotoPerfil = imagen.path;
      await emFork.flush();
    } catch (dbError: any) {
      console.error('Error updating mascota:', dbError);
    }

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
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error("Error deleting uploaded file:", unlinkErr);
      });
    }

    res.status(500).json({
      message: "Error interno al procesar la imagen",
      error: error.message,
      errorName: error.name
    });
  }
}

export { sanitizeMascota, findAll, findOne, findByOwner, add, update, remove, uploadFiles };