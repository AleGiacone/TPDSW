import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Usuario } from './usuario.entity.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SECRET_JWT_KEY } from '../config.js';
import multer from 'multer';
import path from 'path';
import sanitizeHTML from 'sanitize-html';

declare global {
  namespace Express {
    interface Request {
      usuario?: any;
    }
  }
}
//Ver porque me parece que no va, esta raro tener un usuario any en el codigo


async function sanitizeUsuario(req: Request, res: Response, next: NextFunction) {
  console.log('req.body.session usuario:', req.cookies.access_token);
  req.body.sanitizeInput = {
    email: sanitizeHTML(req.body.email),
    password: sanitizeHTML(req.body.password),
    nombre: sanitizeHTML(req.body.nombre),
    tipoUsuario: 'usuario'
  };
   
  Object.keys(req.body.sanitizeInput).forEach((key) => {
    if (req.body.sanitizeInput[key] === undefined) {
      delete req.body.sanitizeInput[key];
    }
    
  });


  if (req.session?.usuario == null) {
    console.log("No session usuario found");
  }

  console.log("Sanitized input:", req.body.sanitizeInput);

  next();
}



async function findAll(req: Request, res: Response) {
  console.log("Finding all usuarios");
  try {
    const em = orm.em.fork();
    const usuarios = await em.find(Usuario, {});
    res.status(200).json({ message: 'Found all usuarios', data: usuarios });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving usuarios", error: error.message });
  }
}


async function add(req: Request, res: Response) {

  console.log("Adding usuario with body:", req.body);
  const em = orm.em.fork();
  const email = await em.findOne(Usuario, { email: req.body.email });
  if(!email){
    try {
      await authenticate(req.body.sanitizeInput);
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
    const em = orm.em.fork();
    console.log("Updating usuario with body:", req.body);
    const usuario = await em.findOneOrFail(Usuario, { email: req.body.email });
      // Poner un input adicional para que el usuario pueda cambiar su contraseña

    const match = await bcrypt.compare(req.body.sanitizeInput.password, usuario.password);
    em.assign(usuario, req.body.sanitizeInput);
    await em.flush();
    res.status(200).json({ message: 'Usuario updated', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating usuario", error: error.message });
  }
} 

async function remove(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
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
    const em = orm.em.fork();
    const { email, password } = req.body.sanitizeInput;
    
    if (!email || !password) {
      res.status(400).json({ 
        success: false,
        message: 'Email y contraseña son requeridos' 
      });
      return;
    }

    await authenticate(req.body.sanitizeInput);
    const usuario = await em.findOne(Usuario, { email });
    
    if (!usuario) {
      res.status(404).json({ 
        success: false,
        message: 'Credenciales incorrectas' 
      });
      return;
    }

    const isValid = await bcrypt.compare(password, usuario.password);
    
    if (!isValid) {
      res.status(401).json({ 
      success: false,
      message: 'Credenciales incorrectas' 
    });
      return;
    }
    if(!usuario.twoFactorSecret) {
    const token = jwt.sign(
      { 
        idUsuario: usuario.idUsuario, 
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario
      }, 
      SECRET_JWT_KEY, 
      { expiresIn: '1h' }
    );
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 // 1 hora
    });

    res.status(200).json({ 
      success: true,
      message: 'Login exitoso',
      user: {
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        perfilImage: usuario.perfilImage || null
      }
    });
    return;
    } else if (usuario.twoFactorSecret && req.body.token != null) {
        if (usuario && usuario.twoFactorSecret != null) {
        console.log(usuario.twoFactorSecret);
        const secret = usuario.twoFactorSecret;
        const token = req.body.token;
        console.log("Validating 2FA token:", token, "with secret:", secret);
        const result = await verify({ secret, token });
        console.log("Valid:", result.valid); // true
        if(result.valid == true)
        {
          const token = jwt.sign(
                { 
                  idUsuario: usuario.idUsuario, 
                  email: usuario.email,
                  tipoUsuario: usuario.tipoUsuario
                }, 
                SECRET_JWT_KEY, 
                { expiresIn: '1h' }
              );
              res.cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 // 1 hora
              });

              res.status(200).json({ 
                success: true,
                message: 'Login exitoso',
                user: {
                  idUsuario: usuario.idUsuario,
                  nombre: usuario.nombre,
                  email: usuario.email,
                  tipoUsuario: usuario.tipoUsuario,
                  perfilImage: usuario.perfilImage || null
                }
              });
              return;
          }
          else {
              res.status(400).json({
              success: false,
              message: 'Invalid 2FA code'
              })
              return;
          }
      }
    }
      else if (usuario.twoFactorSecret && req.body.token == null) {
        res.status(400).json({
          success: false,
          message: '2FA code is required'
        })
        return;
      }
  
      
    }

    catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: "Error durante el login", 
      error: error.message 
    });
    return;
  }
}


async function authenticate(usuario: Usuario) {
  console.log("Authenticating usuario with body:", usuario);
  try {
    if (usuario.email.includes('@') === false) {
      console.log("Invalid email format:", usuario.email);
      throw new Error('Invalid email format');
    }
    if (usuario.password.length < 4 || usuario.email.length < 5) {
        console.log("Password or email too short:", usuario)
        throw new Error('Password or Email too short');
    }
    } 
  catch (error) {
    console.log("Error during authentication:", error);
    throw new Error('Invalid input data');
  }
}
// Preguntar por funcion que no se usa xd
async function getMe(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    if (!req.usuario) {
      res.status(401).json({ 
        success: false,
        message: 'No autenticado',
        usuario: null 
      });
      return;
    }

    const usuario = await em.findOne(Usuario, { idUsuario: req.usuario.idUsuario });
    
    if (!usuario) {
      res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado',
        usuario: null 
      });
      return;
    }

    let userData: any = {
      idUsuario: usuario.idUsuario,
      nombre: usuario.nombre,
      email: usuario.email,
      tipoUsuario: usuario.tipoUsuario,
      perfilImage: usuario.perfilImage || null
    };

    if (usuario.tipoUsuario === 'dueno' || usuario.tipoUsuario === 'cuidador') {
      userData.nroDocumento = (usuario as any).nroDocumento || null;
      userData.tipoDocumento = (usuario as any).tipoDocumento || null;
      userData.telefono = (usuario as any).telefono || null;
    }

    if (usuario.tipoUsuario === 'dueno') {
      userData.telefonoEmergencia = (usuario as any).telefonoEmergencia || null;
    }

    if (usuario.tipoUsuario === 'cuidador') {
      userData.sexoCuidador = (usuario as any).sexoCuidador || null;
      userData.descripcion = (usuario as any).descripcion || null;
    }

    res.status(200).json({ 
      success: true,
      usuario: userData 
    });
    return;

  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      message: "Error verificando sesión", 
      error: error.message 
    });
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
    const emFork = orm.em.fork();
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


async function findOne(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const idUsuario = Number(req.params.idUsuario);
    const usuario = await em.findOneOrFail(Usuario, { idUsuario: idUsuario });
    res.status(200).json({ message: 'Usuario found', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving usuario", error: error.message });
  }
}

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log("🔒 Auth middleware - Cookies:", req.cookies);
  
  const token = req.cookies.access_token; 
  
  if (!token) {
    res.status(401).json({ 
      success: false,
      error: 'No autenticado',
      usuario: null   
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_JWT_KEY!) as any;
    req.usuario = decoded;
    next(); 
  } catch (err) {
    res.status(403).json({ 
      success: false,
      error: 'Token inválido',
      usuario: null 
    });
    return;
  }
}


// TOTP Y 2FA utilizando otplib 

import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode"; // npm install qrcode

async function setupTwoFactor(req: Request, res: Response, next: NextFunction) {
  console.log("Setting up 2FA for user:", req.body.email);
  if(!req.body.email) {
    res.status(400).json({ 
      success: false,
      message: 'Email is required for 2FA setup' 
    });
    return;
  }
  // Generate a new secret
  const secret = generateSecret();

  // Create otpauth:// URI
  if(req.body.email) {
  const em = orm.em.fork();
  const uri = generateURI({
    issuer: "MyApp",
    label: req.body.email,
    secret,
  });

  // Generate QR code as data URL
  const qrDataUrl = await QRCode.toDataURL(uri);
  console.log("qrDataUrl:", qrDataUrl);
  const usuario = await em.findOne(Usuario, { email: req.body.email });
  if(!usuario) {
    res.status(404).json({ 
      success: false,
      message: 'Usuario not found' 
    });
    return;
  }
  em.assign(usuario, { twoFactorSecret: secret });
  await em.flush();
  res.status(200).json({
    success: true,
    qrDataUrl
  })}
 ;
}

async function codeValidation(req: Request, res: Response) {
  const em = orm.em.fork();
  const usuario = await em.findOne(Usuario, { email: req.body.email });
  if (usuario && usuario.twoFactorSecret != null) {
    console.log(usuario.twoFactorSecret);
    const secret = usuario.twoFactorSecret;
    const token = req.body.token;
    console.log("Validating 2FA token:", token, "with secret:", secret);
    const result = await verify({ secret, token });
    console.log("Valid:", result.valid); // true
    if(result.valid == true)
    {
      res.status(200).json({
        success: true,
        message: '2FA code valid'
      })
    }
    else {
      res.status(400).json({
        success: false,
        message: 'Invalid 2FA code'
      })
    }
  }
  

}

import { generate, verify } from "otplib";
import { nextTick } from 'process';

// Generate a secret


// // Generate current token
// const token = await generate({ secret });
// console.log("Token:", token); // e.g., "123456"

// // Verify a token
// const result = await verify({ secret, token });
// console.log("Valid:", result.valid); // true
// // result.epoch is available here for TOTP



export { sanitizeUsuario, authMiddleware, findAll, findOne, add, update, remove, loginCtrl, authenticate, uploadFiles, getMe, setupTwoFactor, codeValidation };