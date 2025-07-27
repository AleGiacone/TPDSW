import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Usuario } from './usuario.entity.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SECRET_JWT_KEY } from '../config.js';
import multer from 'multer';
import path from 'path';




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
  
  console.log("Updating usuario with body:", req.body);

  try {
    console.log("Updating usuario with body:", req.body);
    const usuario = await em.findOneOrFail(Usuario, { email: req.body.email });
      // Poner un input adicional para que el usuario pueda cambiar su contraseña
    if (usuario.password !== req.body.sanitizeInput.password) { 
      // El 10 representa el número de rondas de sal o hashing
      req.body.sanitizeInput.password = await bcrypt.hash(req.body.sanitizeInput.password, 10);
    }
    em.assign(usuario, req.body.sanitizeInput);
    await em.flush();
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
  console.log('Body completo:', req.body);

  console.log("Login controller called with body:", req.body.sanitizeInput);
  // Resolver problema de que no encuentra el mail y tira otro error
  try {
    const { email, password } = req.body.sanitizeInput;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }
    await authenticate(req.body.sanitizeInput, res);
    console.log("Login controller called with body:", email, password);
    const usuario = await em.findOne(Usuario, { email });
    console.log("Found usuario:", usuario);
    if (!usuario) {
      console.log("Email not found:", email);
      res.status(404).json({ message: 'Email not found' });
      return;
    }
    const isValid = await bcrypt.compare(password, usuario.password);
    console.log(isValid)
    if (!isValid) {
      console.log("Invalid password for email:", email);
      res.status(401).json({ message: 'Invalid password' });
      return;
    }
    if (usuario && isValid) {
      console.log("Valid usuario found:", usuario);
      const { password, idUsuario, ...publicUser } = usuario;
      const token = jwt.sign(
        { idUsuario: idUsuario, email: email, perfilImage: usuario.perfilImage }, 
        SECRET_JWT_KEY, 
        { expiresIn: '1h' });
      res.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 // 1 hour
      });
      
      console.log("Generated JWT:", token);
      res.status(200).json({ message: 'Login successful', data: { idUsuario: usuario.idUsuario, email: usuario.email, perfilImage: usuario.perfilImage }, token:
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
    const email = req.session.usuario.email;
    const emFork = em.fork();
      try {
        console.log("EL FUCKING MAIL", email);
        if (!req.file) {
          res.status(400).json({ message: 'No file uploaded' });
          return;
        }
        const usuario = await emFork.findOneOrFail(Usuario, { email: req.session.usuario.email})
        console.log("Found usuario for upload:", usuario);
        usuario.perfilImage = '/img/perfilImages/' + req.file.filename;
        await emFork.flush();

      } catch (error) {
        console.log("Error during file upload:", error);
        return;
      }
    }
}


function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Token no enviado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_JWT_KEY!);
    req.usuario = decoded; // Guarda los datos del usuario en el request
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido' });
  }
}
export default authMiddleware;



export { sanitizeUsuario, findAll, findOne, add, update, remove, loginCtrl, authenticate, uploadFiles };