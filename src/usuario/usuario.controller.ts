import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Usuario } from './usuario.entity.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SECRET_JWT_KEY } from '../config.js';

const em = orm.em

async function sanitizeUsuario(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeInput = {
    email: req.body.email,
    password: req.body.password,
    nombre: req.body.nombre,
    tipoUsuario: 'usuario'
  };
  
  Object.keys(req.body.sanitizeInput).forEach((key) => {
    if (req.body.sanitizeInput[key] === undefined) {
      delete req.body.sanitizeInput[key];
    }
    
  });
  
  next();
}


// Probar usar zod en vez de sanitizeInput

async function findAll(req: Request, res: Response) {
  try {
    const usuarios = await orm.em.find(Usuario, {});
    res.status(200).json({ message: 'Found all usuarios', data: usuarios });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving usuarios", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const idUsuario = Number(req.params.idUsuario);
    const usuario = await em.findOneOrFail(Usuario, { idUsuario: idUsuario });
    res.status(200).json({ message: 'Usuario found', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving usuario", error: error.message });
  }
}

async function add(req: Request, res: Response) {

  console.log("Adding usuario with body:", req.body);
  const email = await em.findOne(Usuario, { email: req.body.email });
  if(!email){
    try {
      await authenticate(req.body.sanitizeInput, res);
      req.body.sanitizeInput.password = await bcrypt.hash(req.body.sanitizeInput.password, 10);
      const usuario = em.create(Usuario, req.body.sanitizeInput);
      await em.flush();
      res.status(200).json({ message: 'Usuario created', data: usuario });
      return ;

  } catch (error: any) {
    res.status(500).json({ message: "Error creating usuario", error: error.message });
    return;
  }
  } else {
    console.log("Email already exists:", email);
    res.status(400).json({ message: 'Email already exists' });
    return;
  }

} 

async function update(req: Request, res: Response) {
  try {
    const idUsuario = Number.parseInt(req.params.idUsuario);
    const usuario = await orm.em.findOneOrFail(Usuario, { idUsuario: idUsuario });
    orm.em.assign(usuario, req.body.sanitizeInput);
    await orm.em.flush();
    res.status(200).json({ message: 'Usuario updated', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating usuario", error: error.message });
  }
} 

async function remove(req: Request, res: Response) {
  try {
    const idUsuario = Number.parseInt(req.params.idUsuario);
    const usuario = await em.findOneOrFail(Usuario, { idUsuario: idUsuario });
    await em.removeAndFlush(usuario);
    res.status(200).json({ message: 'Usuario removed', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing usuario", error: error.message });
  }
}   

async function loginCtrl(req: Request, res: Response) {
  try {
    const { email, password } = req.body.sanitizeInput;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    await authenticate(req.body.sanitizeInput, res);
    console.log("Login controller called with body:", email, password);
    const usuario = await em.findOne(Usuario, { email });
    if (!usuario) {
      res.status(404).json({ message: 'Email not found' });
      return;
    }
    const isValid = await bcrypt.compare(password, usuario.password);
    console.log(isValid)
    if (!isValid) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }
    if (usuario && isValid) {
      const { password, idUsuario, ...publicUser } = usuario;
      const token = jwt.sign(
        { idUsuario: idUsuario, email: email }, 
        SECRET_JWT_KEY, 
        { expiresIn: '1h' });
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 // 1 hour
      });
      console.log("Generated JWT:", token);
      res.status(200).json({ message: 'Login successful', data: { idUsuario: usuario.idUsuario, email: usuario.email }, 
        token });
      return;
      
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
      return
    }
  } catch (error: any) {
    res.status(401).json({ message: "Error during login", error: error.message });
    return;
  }
}
// Arreglar admin, cuidador y dueno

async function authenticate(usuario: Usuario, res: Response) {
  console.log("Authenticating usuario with body:", usuario);
  try {
    if (usuario.email.includes('@') === false) {
      console.log("Invalid email format:", usuario.email);
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }
    if (usuario.password.length < 4 || usuario.email.length < 5) {
        console.log("Password or email too short:", usuario)
        res.status(400).json({ message: 'Password or Email too short' });
        return;
    }
    } 
  catch (error) {
    console.log("Error during authentication:", error);
    res.status(400).json({ message: 'Invalid input data' });
    return;
  }
}

export { sanitizeUsuario, findAll, findOne, add, update, remove, loginCtrl, authenticate };