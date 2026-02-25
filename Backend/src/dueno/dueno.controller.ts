import {Request, Response, NextFunction} from 'express';
import { Dueno } from './dueno.entity.js';
import { orm } from '../shared/db/orm.js';
import { Usuario } from '../usuario/usuario.entity.js';
import bcrypt from 'bcrypt';
import sanitizeHTML from 'sanitize-html';
import fs from 'fs'; 
import path from 'path'; 
import jwt from 'jsonwebtoken';
import { SECRET_JWT_KEY } from '../config.js';

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
    const em = orm.em.fork();
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
    res.status(500).json({ message: "Error authenticating dueno" });
  }
}

async function authenticateUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const em = orm.em.fork();
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
    res.status(500).json({ message: "Error authenticating update" });
  }
}

async function findAll(req: Request, res: Response) {
  try {
    const em = orm.em.fork();

    const duenos = await em.find(Dueno, {});
    await em.populate(duenos, ['mascotas']);
    res.status(200).json({ message: 'Found all duenos', data: duenos });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving duenos" });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const em = orm.em.fork();

    const idUsuario = Number(req.params.idUsuario);
    const dueno = await em.findOneOrFail(Dueno, { idUsuario }, { populate: ['mascotas'] });
    res.status(200).json({ message: 'Dueno found', data: dueno});
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving dueno" });
  }
}

async function add(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
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
    res.status(500).json({ message: "Error creating dueno" });
  }
}

async function findPets(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const token = req.cookies.access_token;
        const decoded = jwt.verify(token, SECRET_JWT_KEY!);
              req.usuario = decoded;
              if(req.body.idUsuario != req.usuario.idUsuario && req.params.idUsuario != req.usuario.idUsuario && req.usuario.tipoUsuario !== 'admin') {
                res.status(403).json({ 
                  success: false,
                  message: 'Acceso denegado',
                  usuario: null});
                return;
              }
    const idUsuario = Number(req.params.idUsuario);
    const dueno = await em.findOneOrFail(Dueno, { idUsuario }, { populate: ['mascotas'] });
    res.status(200).json({ message: 'Mascotas found', data: dueno.mascotas });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving mascotas" });
  }
}

async function updateDueno(req: Request, res: Response): Promise<void> {
  try {
    const token = req.cookies.access_token;
        const decoded = jwt.verify(token, SECRET_JWT_KEY!);
              req.usuario = decoded;
              if(req.body.idUsuario != req.usuario.idUsuario && req.params.idUsuario != req.usuario.idUsuario && req.usuario.tipoUsuario !== 'admin') {
                res.status(403).json({ 
                  success: false,
                  message: 'Acceso denegado',
                  usuario: null});
                return;
              }
    const em = orm.em.fork();
    const idUsuario = Number.parseInt(req.params.idUsuario as string);
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
    res.status(500).json({ message: "Error updating dueno" });
  }
}

async function remove(req: Request, res: Response) {
  console.log("🚀 Starting dueno removal process...",req.params.idUsuario);
  const emFork = orm.em.fork();
  try {
    const idUsuario = Number.parseInt(req.params.idUsuario as string);
/*const token = req.cookies.access_token;
        const decoded = jwt.verify(token, SECRET_JWT_KEY!);
              req.usuario = decoded;
              if(req.body.idUsuario != req.usuario.idUsuario  && req.params.idUsuario != req.usuario.idUsuario && req.usuario.tipoUsuario !== 'admin') {
                res.status(403).json({ 
                  success: false,
                  message: 'Acceso denegado',
                  usuario: null});
                return;
              }*/
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
    res.status(500).json({ message: "Error removing dueno (Fallo en cascada forzada)" });
  }
}

async function updateProfileImageDueno(req: Request, res: Response): Promise<void> {
  const emFork = orm.em.fork(); 
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
      message: "Error al actualizar la imagen de perfil del dueño"
    });
  }
}

async function deleteProfileImageDueno(req: Request, res: Response): Promise<void> {
  try {
    const em = orm.em.fork();
    const token = req.cookies.access_token;
    const decoded = jwt.verify(token, SECRET_JWT_KEY!);
          req.usuario = decoded;
          if(req.params.idUsuario != req.usuario.idUsuario ) {
            res.status(403).json({ 
              success: false,
              message: 'Acceso denegado',
              usuario: null});
            return;
          }
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
    res.status(500).json({ message: "Error deleting dueno profile image" });
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