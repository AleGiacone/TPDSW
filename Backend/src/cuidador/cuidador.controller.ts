import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Cuidador } from './cuidador.entity.js';
import sanitizeHTML from 'sanitize-html';
import fs from 'fs';
import path from 'path';

const sanitizeCuidador = (req: Request, res: Response, next: NextFunction) => {
  req.body.sanitizeInput = {
    idUsuario: req.params.idUsuario,
    email: sanitizeHTML(req.body.email),
    password: sanitizeHTML(req.body.password),
    nombre: sanitizeHTML(req.body.nombre),
    nroDocumento: sanitizeHTML(req.body.nroDocumento),
    tipoDocumento: sanitizeHTML(req.body.tipoDocumento),
    telefono: sanitizeHTML(req.body.telefono),
    telefonoEmergencia: sanitizeHTML(req.body.telefonoEmergencia),
    sexoCuidador: sanitizeHTML(req.body.sexoCuidador),
    descripcion: sanitizeHTML(req.body.descripcion),
    tipoUsuario: 'cuidador'
  };
  
  Object.keys(req.body.sanitizeInput).forEach((key) => {
    console.log(req.body.sanitizeInput[key])
    if (req.body.sanitizeInput[key] === undefined || req.body.sanitizeInput[key] === '') {
      delete req.body.sanitizeInput[key];
    }
  })
  next();
};

async function authenticateCuidador(req: Request, res: Response): Promise<boolean> {
  try {
    const existingUser = await orm.em.fork().findOne(Usuario, { email: req.body.sanitizeInput.email });
    if (existingUser) {
      res.status(400).json({ message: 'El email ya está en uso' });
      return false;
    }
    const existingDocumento = await orm.em.fork().findOne(Cuidador, { nroDocumento: req.body.sanitizeInput.nroDocumento });
    if (existingDocumento) {
      res.status(400).json({ message: 'El número de documento ya está en uso' });
      return false;
    }
    if (req.body.sanitizeInput.password.length < 6) {
      res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      return false;
    }
    if (req.body.sanitizeInput.nombre.length < 3) {
      res.status(400).json({ message: 'El nombre debe tener al menos 3 caracteres' });
      return false;
    }
    if (req.body.sanitizeInput.nroDocumento.length < 7 || req.body.sanitizeInput.nroDocumento.length > 9) {
      res.status(400).json({ message: 'El numero de documento debe tener entre 7 y 9 caracteres' });
      return false;
    }
    return true;
  } catch (error: any) {
    res.status(500).json({ message: "Error authenticating cuidador", error: error.message });
    return false;
  }
}

async function findAll(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const cuidadores = await em.find(Cuidador, {});
    res.status(200).json({ message: 'Found all cuidadores', data: cuidadores });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving cuidadores", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const idUsuario = Number(req.params.idUsuario);
    const cuidador = await em.findOneOrFail(Cuidador, { idUsuario });
    res.status(200).json({ message: 'Cuidador found', data: cuidador });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving cuidador", error: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    Object.keys(req.body.sanitizeInput).forEach((key) => { 
      if (req.body.sanitizeInput[key] === undefined) {
        res.status(400).json({ message: `El campo ${key} es requerido` });
      }
    });
    const bandera = await authenticateCuidador(req, res);
    console.log("adding", req.body.sanitizeInput.nombre)
    if (bandera){
      req.body.sanitizeInput.password = await bcrypt.hash(req.body.sanitizeInput.password, 10);
      const cuidador = em.create(Cuidador, req.body.sanitizeInput);
      await em.persistAndFlush(cuidador);
      res.status(200).json({ message: 'cuidador created', data: cuidador });
      return;
    }
  } catch (error: any) {
    res.status(500).json({ message: "Error creating cuidador", error: error.message });
    return;
  }
}

async function update(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const bandera = await authenticateUpdate(req, res);
    if (!bandera) return;
    
    const idUsuario = Number.parseInt(req.params.idUsuario);
    const cuidador = await em.findOneOrFail(Cuidador, { idUsuario: idUsuario });
    
    if (!cuidador) {
      res.status(404).json({ message: 'Cuidador not found', data: idUsuario });
      return;
    }
    
    if (req.body.sanitizeInput.password) {
      req.body.sanitizeInput.password = await bcrypt.hash(req.body.sanitizeInput.password, 10);
    }
    
    em.assign(cuidador, req.body.sanitizeInput);
    await em.flush();
    
    res.status(200).json({ message: 'Cuidador updated', data: cuidador });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating cuidador", error: error.message });
  }
}

async function updateProfileImage(req: Request, res: Response): Promise<void> {
  try {
    const em = orm.em.fork();
    const idUsuario = Number(req.params.idUsuario);
    
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const cuidador = await em.findOneOrFail(Cuidador, { idUsuario });
    
    if (cuidador.perfilImage) {
      const oldImagePath = path.join('public', cuidador.perfilImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    cuidador.perfilImage = `/img/perfilImages/${req.file.filename}`;
    await em.flush();

    res.status(200).json({ 
      message: 'Profile image updated', 
      data: {
        idUsuario: cuidador.idUsuario,
        perfilImage: cuidador.perfilImage
      }
    });
  } catch (error: any) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting uploaded file:", err);
      });
    }
    res.status(500).json({ message: "Error updating profile image", error: error.message });
  }
}

async function deleteProfileImage(req: Request, res: Response): Promise<void> {
  try {
    const em = orm.em.fork();
    const idUsuario = Number(req.params.idUsuario);
    
    const cuidador = await em.findOneOrFail(Cuidador, { idUsuario });
    
    if (!cuidador.perfilImage) {
      res.status(404).json({ message: 'No profile image found' });
      return;
    }

    const imagePath = path.join('public', cuidador.perfilImage);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    cuidador.perfilImage = undefined;
    await em.flush();

    res.status(200).json({ message: 'Profile image deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting profile image", error: error.message });
  }
}

async function authenticateUpdate(req: Request, res: Response): Promise<boolean> {
  try {
    const em = orm.em.fork();
    const existingUser = await em.findOne(Cuidador, { idUsuario: req.body.sanitizeInput.idUsuario });
    
    if (!existingUser) {
      res.status(404).json({ message: 'Usuario not found', data: req.body.sanitizeInput.idUsuario });
      return false;
    }
    
    if (req.body.sanitizeInput.nroDocumento != existingUser.nroDocumento && req.body.sanitizeInput.nroDocumento != undefined) {
      const nroDocumento = await em.findOne(Cuidador, { nroDocumento: req.body.sanitizeInput.nroDocumento });
      if (nroDocumento) {
        res.status(400).json({ message: 'El número de documento ya está en uso' });
        return false;
      }
      if (req.body.sanitizeInput.nroDocumento.length < 7 || req.body.sanitizeInput.nroDocumento.length > 9) {
        res.status(400).json({ message: 'El numero de documento debe tener entre 7 y 9 caracteres' });
        return false;
      }
    }
    
    if (req.body.sanitizeInput.email != existingUser.email && req.body.sanitizeInput.email != undefined) {
      const emailInUse = await em.findOne(Usuario, { email: req.body.sanitizeInput.email });
      if (emailInUse) {
        res.status(400).json({ message: 'El email ya está en uso' });
        return false;
      }
    }
    
    if (req.body.sanitizeInput.password != undefined && req.body.sanitizeInput.password.length < 6) {
      res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      return false;
    }
    
    if (req.body.sanitizeInput.nombre != undefined && req.body.sanitizeInput.nombre.length < 3) {
      res.status(400).json({ message: 'El nombre debe tener al menos 3 caracteres' });
      return false;
    }
    
    return true;
  } catch (error: any) {
    res.status(500).json({ message: "Error authenticating update", error: error.message });
    return false;
  }
}

async function remove(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const idUsuario = Number.parseInt(req.params.idUsuario);
    const cuidador = await em.findOneOrFail(Cuidador, { idUsuario: idUsuario });
  
    if (cuidador.perfilImage) {
      const imagePath = path.join('public', cuidador.perfilImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await em.removeAndFlush(cuidador);
    res.status(200).json({ message: 'Cuidador removed', data: cuidador });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing cuidador", error: error.message });
  }
}

export { sanitizeCuidador, findAll, findOne, add, update, remove, updateProfileImage, deleteProfileImage };