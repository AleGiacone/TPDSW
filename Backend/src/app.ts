import type { Request, Response } from "express";
import 'reflect-metadata'
import express from "express";
import {especieRouter} from "./especie/especie.routes.js";
import { razaRouter } from './raza/raza.routes.js';
import { usuarioRouter } from './usuario/usuario.routes.js';
// Instala los Especies con: pnpm add -D @types/express
import jwt from 'jsonwebtoken';
import { orm, syncSchema } from "./shared/db/orm.js";
import { RequestContext } from '@mikro-orm/core';
import cookieParser from 'cookie-parser';
import { SECRET_JWT_KEY } from './config.js';
import { cuidadorRouter } from './cuidador/cuidador.routes.js';
import { duenoRouter } from './dueno/dueno.routes.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { publicacionRouter } from './publicacion/publicacion.routes.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Extend Express Request interface to include 'session'
declare global {
  namespace Express {
    interface Request {
      session?: { usuario: any };
    }
  }
}
const app = express();
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.json());
app.use('/img', express.static(path.join(__dirname, '../public/img')));
//Luego de los middlewares base

app.use((req, res, next) => {
  const token = req.cookies.access_token;
  req.session = { usuario: null }
  try {
    const data = jwt.verify(token, SECRET_JWT_KEY!);
    req.session.usuario = data;
  } catch {}
  next();

})

app.use((req,res,next) => {
  RequestContext.create(orm.em, next)
});

app.use("/api/especies", especieRouter);
app.use("/api/razas", razaRouter);
app.use("/api/usuarios", usuarioRouter);
app.use("/api/login", usuarioRouter);
app.use("/api/duenos", duenoRouter);
app.use("/api/cuidadores", cuidadorRouter);
app.use("/api/usuario/upload-image", usuarioRouter);
app.use("/api/publicacion", publicacionRouter);

app.get("/login", (req, res) => {
  res.render("login");
});
// Middleware funciones donde modificamos peticion o respuesta

app.get('/', (req, res) => {
  const { usuario } = req.session ?? { usuario: null };
  if (!usuario) {
    res.status(401).send('Acceso no autorizado')
    return 
  }
  console.log('estoy aca',usuario);
  res.render('index', { usuario });
});






app.get('/register', (req, res) => {
  res.render("register");
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt with email:");
  // const token = jwt.sign({ idUsuario: idUsuario._idUsuario, email: email}, SECRET_KEY)
  // Implement login logic here
});

app.post('/register', (req, res) => {
  
});



app.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.json({ message: 'Logged out successfully' });
  res.redirect('/login');

});

app.get('/protected', (req, res) => {
});




app.use((_, res) => {
  res.status(404).send({ message: "Not Found" });
  return;  
})

app.use((_, res) => {
  res.status(404).send({ message: "Not Found" });
  return;  
})

const PORT = process.env.PORT || 3000;

await syncSchema(); //Never in production


app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});

