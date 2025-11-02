import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Cuidador } from './cuidador.entity.js';
import sanitizeHTML from 'sanitize-html';
import fs from 'fs';
import path from 'path';

const sanitizeCuidador = (req: Request, res: Response, next: NextFunction) => {
  console.log('Sanitizing cuidador input...');
  const sanitizedData: any = {};

  const campos = [
    'email', 'password', 'nombre', 'nroDocumento', 'tipoDocumento',
    'telefono', 'telefonoEmergencia', 'sexoCuidador', 'descripcion'
  ];

  if (req.params.idUsuario) {
    sanitizedData.idUsuario = Number(req.params.idUsuario);
  }

  campos.forEach(campo => {
    if (req.body[campo] !== undefined && req.body[campo] !== '') {
      sanitizedData[campo] = sanitizeHTML(String(req.body[campo]));
    }
  });

  if (req.method === 'POST' && !req.params.idUsuario) {
    sanitizedData.tipoUsuario = 'cuidador';
  }

  req.body.sanitizeInput = sanitizedData;
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
    const idUsuario = Number.parseInt(req.params.idUsuario);
    const cuidador = await em.findOneOrFail(Cuidador, { idUsuario: idUsuario });
    
    if (!cuidador) {
      res.status(404).json({ message: 'Cuidador not found', data: idUsuario });
      return;
    }
    
    const bandera = await authenticateUpdate(req, res);
    
    if (!bandera) {
      return;
    }
    
    if (req.body.sanitizeInput.password) {
      req.body.sanitizeInput.password = await bcrypt.hash(req.body.sanitizeInput.password, 10);
    }
    
    if (req.file) {
      if (cuidador.perfilImage) {
        const oldImagePath = path.join('public', cuidador.perfilImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      req.body.sanitizeInput.perfilImage = `/img/perfilImages/${req.file.filename}`;
    }
    
    em.assign(cuidador, req.body.sanitizeInput);
    await em.flush();
    
    res.status(200).json(cuidador);
  } catch (error: any) {
    res.status(500).json({ message: "Error updating cuidador", error: error.message });
  }
}

async function updateProfile(req: Request, res: Response): Promise<void> {
    try {
        const em = orm.em.fork();
        const { idUsuario } = req.params;

        const cuidador = await em.findOne(Cuidador, { idUsuario: Number(idUsuario) });
        
        if (!cuidador) {
            res.status(404).json({ message: 'Cuidador no encontrado' });
            return;
        }

        const dataToUpdate = req.body.sanitizeInput || req.body;
        const camposPermitidos = ['nombre', 'email', 'telefono', 'descripcion', 'sexoCuidador'];
        
        if (dataToUpdate.email && dataToUpdate.email !== cuidador.email) {
            const emailExists = await em.findOne(Usuario, { email: dataToUpdate.email });
            if (emailExists) {
                res.status(400).json({ message: 'El email ya está en uso' });
                return;
            }
        }

        let actualizaciones: Record<string, string> = {};
        for (const campo of camposPermitidos) {
            if (dataToUpdate[campo] !== undefined && dataToUpdate[campo] !== '') {
                actualizaciones[campo] = sanitizeHTML(dataToUpdate[campo]);
            }
        }

        if (Object.keys(actualizaciones).length === 0) {
            res.status(400).json({ message: 'No hay campos para actualizar' });
            return;
        }

        em.assign(cuidador, actualizaciones);
        await em.flush();

        res.status(200).json({
            message: 'Perfil actualizado correctamente',
            data: cuidador
        });

    } catch (error: any) {
        res.status(500).json({
            message: 'Error al actualizar perfil',
            error: error?.message ?? String(error)
        });
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

async function findByEmail(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const email = req.body.email;
    const cuidador = await em.findOneOrFail(Cuidador, { email });
    res.status(200).json({ message: 'Cuidador found', data: cuidador });

  } catch (error: any) {
    res.status(500).json({ message: "Error finding cuidador", error: error.message });
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
    const idUsuario = Number(req.params.idUsuario);
    const existingUser = await em.findOne(Cuidador, { idUsuario });
    
    if (!existingUser) {
      res.status(404).json({ message: 'Usuario not found', data: idUsuario });
      return false;
    }
    
    if (req.body.sanitizeInput?.nroDocumento && 
        req.body.sanitizeInput.nroDocumento !== existingUser.nroDocumento) {
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
    
    if (req.body.sanitizeInput?.email && 
        req.body.sanitizeInput.email !== existingUser.email) {
      const emailInUse = await em.findOne(Usuario, { email: req.body.sanitizeInput.email });
      if (emailInUse) {
        res.status(400).json({ message: 'El email ya está en uso' });
        return false;
      }
    }
    
    if (req.body.sanitizeInput?.password && req.body.sanitizeInput.password.length < 6) {
      res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
      return false;
    }
    
    if (req.body.sanitizeInput?.nombre && req.body.sanitizeInput.nombre.length < 3) {
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

export { sanitizeCuidador, findAll, findOne, add, update, remove, updateProfileImage, deleteProfileImage, updateProfile, findByEmail };