import 'dotenv/config'
import { usuarioRouter } from './usuario/usuario.routes.js';
import 'reflect-metadata'
import express from "express";
import {especieRouter} from "./especie/especie.routes.js";
import { razaRouter } from './raza/raza.routes.js';
import { orm, syncSchema } from "./shared/db/orm.js";
import { RequestContext } from '@mikro-orm/core';
import cookieParser from 'cookie-parser';
import { SECRET_JWT_KEY } from './config.js';
import { cuidadorRouter } from './cuidador/cuidador.routes.js';
import { duenoRouter } from './dueno/dueno.routes.js';
import { fileURLToPath } from 'url';
import { publicacionRouter } from './publicacion/publicacion.routes.js';
import { mascotaRouter } from './mascota/mascota.routes.js';
import { imagenRouter } from './imagen/imagenes.routes.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import cors from 'cors';
import { reservaRouter, webHookRouter } from './reserva/reserva.routes.js';
import rateLimit from 'express-rate-limit';
import { adminRouter } from './admin/admin.routes.js';

console.log('ENV:', process.env.STRIPE_SECRET_KEY)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

declare global {
  namespace Express {
    interface Request {
      session?: { usuario: any };
    }
  }
}

const app = express();

// 🔍 MIDDLEWARE DE DEBUG PARA WEBHOOK
app.use('/api/webhook', (req, res, next) => {
  console.log('\n\n🚨🚨🚨 ¡WEBHOOK STRIPE INTERCEPTADO! 🚨🚨🚨');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('📍 URL:', req.url);
  console.log('📊 Método:', req.method);
  console.log('🎫 Headers clave:');
  console.log('   - Content-Type:', req.headers['content-type']);
  console.log('   - Stripe-Signature:', req.headers['stripe-signature']?.toString().substring(0, 50) + '...');
  next();
});

app.use("/api/webhook/stripe", express.raw({ type: 'application/json' }), webHookRouter);
app.use(cookieParser());
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3307',
  'http://localhost:3308',
  'https://tpdsw-phi.vercel.app',
  process.env.VITE_URL?.replace(/\/$/, ''),
].filter(Boolean) as string[];
console.log('🌐 CORS allowedOrigins:', allowedOrigins);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(process.cwd(), 'public')));

console.log('📂 Sirviendo archivos estáticos desde:', path.join(__dirname, '../public/img'));

app.use((req, res, next) => {
  // Excluir webhook de Stripe
  if (req.path.startsWith('/api/webhook/stripe')) {
    return next();
  }

  console.log('Token recibido:', req.cookies.access_token);
  const token = req.cookies.access_token;
  req.session = { usuario: null }
  try {
    const data = jwt.verify(token, SECRET_JWT_KEY!);
    req.session.usuario = data;
  } catch { }
  next();
})

/*
app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
});
*/

// Rate limiter general - EXCLUIR WEBHOOK DE STRIPE
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500,                  // 100 requests por IP
  standardHeaders: true,     // Devuelve info en headers `RateLimit-*`
  legacyHeaders: false,      // Deshabilita headers `X-RateLimit-*`
  skip: (req) => req.path.startsWith('/api/webhook/stripe'), // ✅ EXCLUIR WEBHOOK
  handler: (req, res) => {
    res.status(429).json({ message: 'Demasiadas solicitudes, intenta más tarde' });
  }
});

app.use(generalLimiter); 

app.use("/api/admin", adminRouter);
app.use("/api/usuarios", usuarioRouter);
app.use("/api/mascotas", mascotaRouter);
app.use("/api/especies", especieRouter);
app.use("/api/razas", razaRouter);
app.use("/api/duenos", duenoRouter);
app.use("/api/cuidadores", cuidadorRouter);
app.use("/api/usuario/upload-image", usuarioRouter);
app.use("/api/publicacion", publicacionRouter);
app.use("/api/imagenes", imagenRouter);
app.use("/api/reservas", reservaRouter);


app.get('/', (req, res) => {
  
  console.log('Session:', req.session);
  console.log(`Endpoint llamado: ${req.method} ${req.url}`);
  const { usuario } = req.session ?? { usuario: null };
  if (!usuario) {
    res.status(401).send('Acceso no autorizado')
    return 
  }
  res.json({ message: 'Bienvenido', usuario });
});


app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

app.get('/api/usuario/me', (req, res) => {
  res.json({ usuario: req.session?.usuario || null });
})

app.get('/register', (req, res) => {
  res.json({ message: 'Register page' });
});

app.post('/register', (req, res) => {
  
});

app.post('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/protected', (req, res) => {

});

// 404 Handler
app.use((_, res) => {
  res.status(404).send({ message: "Not Found" });
  return;  
})


const PORT = process.env.PORT || 3000;

// Envolver en una función async
async function startServer() {
  await syncSchema(); // Never in production

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Llamar la función
startServer();

export default app;