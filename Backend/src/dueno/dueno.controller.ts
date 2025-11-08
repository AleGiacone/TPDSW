import {Request, Response, NextFunction} from 'express';
import { Dueno } from './dueno.entity.js';
import { orm } from '../shared/db/orm.js';
import { Usuario } from '../usuario/usuario.entity.js';
import bcrypt from 'bcrypt';
import sanitizeHTML from 'sanitize-html';
import fs from 'fs'; 
import path from 'path'; 

const em = orm.em;

function sanitizeDueno(req: Request, res: Response, next: NextFunction) {
    
  req.body.sanitizeInput = {
    idUsuario: sanitizeHTML(req.body.idUsuario),
    nombre: sanitizeHTML(req.body.nombre),
    email: sanitizeHTML(req.body.email),
    password: sanitizeHTML(req.body.password),
    tipoUsuario: 'dueno',
    nroDocumento: sanitizeHTML(req.body.nroDocumento),
    tipoDocumento: sanitizeHTML(req.body.tipoDocumento),
    telefono: sanitizeHTML(req.body.telefono),
    telefonoEmergencia: sanitizeHTML(req.body.telefonoEmergencia)
  }

  Object.keys(req.body.sanitizeInput).forEach((key) => {
    if (req.body.sanitizeInput[key] === undefined || req.body.sanitizeInput[key] === '') {
      delete req.body.sanitizeInput[key];
    }
  });

  console.log("Sanitized input:", req.body.sanitizeInput);

  next();
}

async function authenticateDueno(req: Request, res: Response, next: NextFunction) {
  try {
    const existingUser = await em.findOne(Usuario, { email: req.body.sanitizeInput.email });
    if (existingUser) {
      res.status(400).json({ message: 'El email ya está en uso' });
      return;
    }
    
    const existingDocumento = await em.findOne(Dueno, { nroDocumento: req.body.sanitizeInput.nroDocumento });
    if (existingDocumento) {
      res.status(400).json({ message: 'El número de documento ya está en uso' });
      return;
    }
    
    if (req.body.sanitizeInput.password.length < 6) {
      res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }
    
    if (req.body.sanitizeInput.nombre.length < 3) {
      res.status(400).json({ message: 'El nombre debe tener al menos 3 caracteres' });
      return;
    }
    
    if (req.body.sanitizeInput.nroDocumento.length < 7 || req.body.sanitizeInput.nroDocumento.length > 9) {
      res.status(400).json({ message: 'El numero de documento debe tener entre 7 y 9 caracteres' });
      return;
    }
    
    next();
  } catch (error: any) {
    res.status(500).json({ message: "Error authenticating dueno", error: error.message });
  }
}

async function authenticateUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idUsuario = Number(req.params.idUsuario);
    const existingUser = await em.findOne(Dueno, { idUsuario });
    
    if (!existingUser) {
      res.status(404).json({ message: 'Usuario no encontrado', data: idUsuario });
      return;
    }
    
    if (req.body.sanitizeInput?.nroDocumento && 
        req.body.sanitizeInput.nroDocumento !== existingUser.nroDocumento) {
      const nroDocumento = await em.findOne(Dueno, { nroDocumento: req.body.sanitizeInput.nroDocumento });
      if (nroDocumento) {
        res.status(400).json({ message: 'El número de documento ya está en uso' });
        return;
      }
      if (req.body.sanitizeInput.nroDocumento.length < 7 || req.body.sanitizeInput.nroDocumento.length > 9) {
        res.status(400).json({ message: 'El numero de documento debe tener entre 7 y 9 caracteres' });
        return;
      }
    }
    
    if (req.body.sanitizeInput?.email && 
        req.body.sanitizeInput.email !== existingUser.email) {
      const emailInUse = await em.findOne(Usuario, { email: req.body.sanitizeInput.email });
      if (emailInUse) {
        res.status(400).json({ message: 'El email ya está en uso' });
        return;
      }
    }
    
    if (req.body.sanitizeInput?.password && req.body.sanitizeInput.password.length < 6) {
      res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }
    
    if (req.body.sanitizeInput?.nombre && req.body.sanitizeInput.nombre.length < 3) {
      res.status(400).json({ message: 'El nombre debe tener al menos 3 caracteres' });
      return;
    }
    
    next();
  } catch (error: any) {
    res.status(500).json({ message: "Error authenticating update", error: error.message });
  }
}

async function findAll(req: Request, res: Response) {
  try {
    const duenos = await em.find(Dueno, {});
    await em.populate(duenos, ['mascotas']);
    res.status(200).json({ message: 'Found all duenos', data: duenos });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving duenos", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const idUsuario = Number(req.params.idUsuario);
    const dueno = await em.findOneOrFail(Dueno, { idUsuario }, { populate: ['mascotas'] });
    res.status(200).json({ message: 'Dueno found', data: dueno});
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving dueno", error: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const email = await em.findOne(Usuario, { email: req.body.sanitizeInput.email });
    if (email) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }
    
    req.body.sanitizeInput.password = await bcrypt.hash(req.body.sanitizeInput.password, 10);
    const dueno = em.create(Dueno, req.body.sanitizeInput);
    await em.flush();
    res.status(200).json({ message: 'Dueno created', data: dueno });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating dueno", error: error.message });
  }
}

async function findPets(req: Request, res: Response) {
  try {
    const idUsuario = Number(req.params.idUsuario);
    const dueno = await em.findOneOrFail(Dueno, { idUsuario }, { populate: ['mascotas'] });
    res.status(200).json({ message: 'Mascotas found', data: dueno.mascotas });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving mascotas", error: error.message });
  }
}

async function updateDueno(req: Request, res: Response): Promise<void> {
  try {
    const idUsuario = Number.parseInt(req.params.idUsuario);
    const dueno = await em.findOneOrFail(Dueno, { idUsuario });

    if (!dueno) {
      res.status(404).json({ message: 'Dueno not found', data: idUsuario });
      return;
    }

    if (req.body.sanitizeInput.password) {
      req.body.sanitizeInput.password = await bcrypt.hash(req.body.sanitizeInput.password, 10);
    }

    em.assign(dueno, req.body.sanitizeInput);
    await em.flush();

    res.status(200).json({ message: 'Dueno updated', data: dueno });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating dueno", error: error.message });
  }
}

async function remove(req: Request, res: Response) {
  const emFork = em.fork();
  try {
    const idUsuario = Number.parseInt(req.params.idUsuario);

    
    const dueno = await emFork.findOneOrFail(Dueno, { idUsuario }, {
      populate: ['mascotas.imagen', 'reservas'] 
    });

    if (dueno.mascotas?.isInitialized()) {
      for (const mascota of dueno.mascotas.getItems()) {
        if (mascota.imagen) {
         
          const imagePath = path.join('public', mascota.imagen.path);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }

          await emFork.remove(mascota.imagen);
        }
      }
 
      await emFork.remove(dueno.mascotas);
    }

    if (dueno.reservas?.isInitialized()) {
      await emFork.remove(dueno.reservas);
    }

    if (dueno.perfilImage) {
      const imagePath = path.join('public', dueno.perfilImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    await emFork.remove(dueno);
    await emFork.flush(); 

    res.status(200).json({ message: 'Dueno eliminado (Cascada limpia exitosa)', data: dueno });
  } catch (error: any) {
    console.error("🚨 CRITICAL DB ERROR during Dueno removal:", error);
    res.status(500).json({ message: "Error removing dueno (Fallo en cascada forzada)", error: error.message });
  }
}

async function updateProfileImageDueno(req: Request, res: Response): Promise<void> {
  const emFork = em.fork(); 
  try {
    const idUsuario = Number(req.params.idUsuario);

    if (!req.file) {
    
      res.status(400).json({ message: 'No se recibió ningún archivo de imagen.' });
      return;
    }

    const dueno = await emFork.findOneOrFail(Dueno, { idUsuario });

    
    if (dueno.perfilImage) {
      const oldImagePath = path.join('public', dueno.perfilImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
        console.log(`✅ Imagen anterior eliminada: ${oldImagePath}`);
      }
    }

   
    dueno.perfilImage = `/img/perfilImages/${req.file.filename}`;
    await emFork.flush(); 

    res.status(200).json({
      message: 'Profile image updated successfully',
      data: {
        idUsuario: dueno.idUsuario,
        perfilImage: dueno.perfilImage
      }
    });
  } catch (error: any) {
    console.error("🚨 CRITICAL ERROR in updateProfileImageDueno:", error);

    
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error al eliminar el archivo subido temporalmente:", err);
      });
    }

   
    res.status(500).json({
      message: "Error al actualizar la imagen de perfil del dueño",
      error: error.message || String(error)
    });
  }
}

async function deleteProfileImageDueno(req: Request, res: Response): Promise<void> {
  try {
    const idUsuario = Number(req.params.idUsuario);
    const dueno = await em.findOneOrFail(Dueno, { idUsuario });
    
    if (!dueno.perfilImage) {
      res.status(404).json({ message: 'No profile image found' });
      return;
    }

    const imagePath = path.join('public', dueno.perfilImage);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    dueno.perfilImage = undefined;
    await em.flush();

    res.status(200).json({ message: 'Profile image deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting dueno profile image", error: error.message });
  }
}

export { 
  sanitizeDueno, 
  findAll, 
  findOne, 
  add, 
  updateDueno, 
  remove, 
  findPets, 
  authenticateDueno, 
  authenticateUpdate, 
  updateProfileImageDueno, 
  deleteProfileImageDueno
};