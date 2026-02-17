import dotenv from 'dotenv';
dotenv.config();
import e, { Request, Response, NextFunction } from "express";
import { Reserva } from "./reserva.entity.js";
import { orm } from "../shared/db/orm.js";
import { authenticate } from "../usuario/usuario.controller.js";
import { Publicacion } from "../publicacion/publicacion.entity.js";
import { Dueno } from "../dueno/dueno.entity.js";
import { nextTick } from "process";
import { Mascota } from "../mascota/mascota.entity.js"
import { Usuario } from "../usuario/usuario.entity.js";
import { publicDecrypt } from "crypto";
import { Temporal } from 'temporal-polyfill'
import { DiaReservado } from "./diaReservado.entity.js";
import { Collection, now } from "mongoose";
import 'dotenv/config';
import sanitizeHTML from 'sanitize-html';

//Agrego campos sanitizados
function sanitizeReserva(req: Request, res: Response, next: NextFunction) {
    console.log("Sanitizing reserva with data:", req.body);
  req.body.sanitizeInput = {
    idReserva: req.body.idReserva,
    fechaReserva: req.body.fechaReserva ? sanitizeHTML(String(req.body.fechaReserva)) : undefined,
    descripcion: req.body.descripcion ? sanitizeHTML(String(req.body.descripcion)) : undefined,
    idDueno: req.body.idDueno,
    idMascotas: req.body.idMascotas,
    idPublicacion: req.body.idPublicacion,
    dias: req.body.dias,
    fechaDesde: req.body.fechaDesde ? new Date(req.body.fechaDesde) : undefined,  
    fechaHasta: req.body.fechaHasta ? new Date(req.body.fechaHasta) : undefined, 
    //agregar sanitizacion de los campos que se necesiten
  };
  Object.keys(req.body.sanitizeInput).forEach((key) => {
    if (req.body.sanitizeInput[key] === undefined) {
      delete req.body.sanitizeInput[key];
    }
  });

  if (req.body.sanitizeInput.dias != null && req.body.sanitizeInput.dias != undefined) {
    try {
      for (let dias of req.body.sanitizeInput.dias) {
        console.log("Sanitizing date:", dias);
        Temporal.PlainDate.from(dias);
      }
    } catch (error) {
      res.status(400).json({ message: "Error parsing dates", error: error });
      return;
    }
  }
  next();
}


async function findAll(req: Request, res: Response) {
  try {
    const em = orm.em.fork();

    const reservas = await em.find(Reserva, {}, {
      populate: [
        "dueno",
        "mascotas",
        "mascotas.especie",
        "mascotas.raza",
        "mascotas.imagen",
        "diasReservados",
        "publicacion",
        "publicacion.imagenes",
        "publicacion.idCuidador"  // ✅ Esto carga el cuidador completo
      ]
    });

    res.status(200).json({ message: "finded all reservas", data: reservas });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving reservas", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
  const em = orm.em.fork();

    const idReserva = Number(req.params.idReserva);
    const reserva = await em.findOneOrFail(Reserva, { idReserva }, { populate: ["dueno", "mascotas", "publicacion"] });
    res.status(200).json({ message: "Reserva found", data: reserva });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving reserva", error: error.message });
  }
}


// Función para verificar si las fechas están disponibles. Esta a parte para no molestar con los nombres 
async function verifyDate(req: Request, res: Response, next: NextFunction) {
  try {
    const em = orm.em.fork();
    console.log("Verificando fechas para reserva con data:", req.body.sanitizeInput);

    const dias: Temporal.PlainDate[] = [];
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion: req.body.sanitizeInput.idPublicacion }, {  populate: ['reservas', 'diasOcupados']  });

    const reservasDeLaPublicacion = await em.find(Reserva, { publicacion: publicacion }, { populate: ['diasReservados'] });
    //Todos los dias ya reservados en esa publicacion
    const diasReservados = reservasDeLaPublicacion.map(r => r.diasReservados.getItems().map(d => d.fechaReservada)).flat();

    //Dias reservados de la mascota
    const mascota = await em.findOneOrFail(Mascota, { idMascota: req.body.sanitizeInput.idMascotas[0] }, { populate: ['reservas', 'reservas.diasReservados'] });
    const reservasDeLaMascota = mascota.reservas.getItems();
    const diasReservadosDeLaMascota = reservasDeLaMascota.map(r => r.diasReservados.getItems().map(d => d.fechaReservada)).flat();
    

    //Verificar si la mascota esta reservada en esa fecha
    console.log("Dias ya reservados de la mascota:", diasReservadosDeLaMascota);
    for (let dia of req.body.sanitizeInput.dias) {
      if(diasReservadosDeLaMascota.includes(Temporal.PlainDate.from(dia).toString())){
        res.status(400).json({ message: `La fecha ${Temporal.PlainDate.from(dia).toString()} ya está reservada para la mascota.` });
        return;
      }
    }

    const diasOcupados = publicacion.diasOcupados.getItems().map(d => d.fechaReservada);
    for (let dia of req.body.sanitizeInput.dias) {
      if(diasOcupados.includes(Temporal.PlainDate.from(dia).toString())){
        res.status(400).json({ message: `La fecha ${Temporal.PlainDate.from(dia).toString()} ya está ocupada en la publicación.` });
        return;
      }
    }

    console.log("Dias ya reservados en la publicacion:", diasReservados);

    for (let dia of req.body.sanitizeInput.dias) {
      console.log("Fechas", req.body.sanitizeInput.dias);
      console.log("Procesando dia:", Temporal.PlainDate.from(dia).toString());
      if (diasReservados.includes(Temporal.PlainDate.from(dia).toString())) {
        res.status(400).json({ message: `La fecha ${Temporal.PlainDate.from(dia).toString()} ya está reservada en la publicación.` });
        return;
      }
    }
  } catch (error: any) {
    res.status(500).json({ message: "Error verifying dates", error: error.message });
    return;
  }
  next();
}



async function add(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    console.log("Creando reserva")
    let fechaDesde = req.body.sanitizeInput.fechaDesde;
    let fechaHasta = req.body.sanitizeInput.fechaHasta;

    const reserva = em.create(Reserva, req.body.sanitizeInput);
    console.log("Agregar dias reservados")
    //Agregar dias reservados
    for (const dia of req.body.sanitizeInput.dias) {
      const diaReservado = em.create(DiaReservado, { fechaReservada: dia, reserva: reserva });
      reserva.diasReservados.add(diaReservado);
    }

    console.log("Agregar mascotas")
    //Agregar mascotas - solo si se proporcionan
    if (req.body.sanitizeInput.idMascotas && req.body.sanitizeInput.idMascotas.length > 0) {
      for (const idMascota of req.body.sanitizeInput.idMascotas) {
        const mascota = await em.findOneOrFail(Mascota, { idMascota: idMascota, dueno: req.body.sanitizeInput.idDueno });
        reserva.mascotas.add(mascota);
      }
    }

    console.log("Agregar publicacion")
    //Agregar publicacion
    const publi = await em.findOneOrFail(Publicacion, { idPublicacion: req.body.sanitizeInput.idPublicacion });
    reserva.publicacion = publi;
    publi.reservas.add(reserva)

    console.log("Agregar dueno")
    //Agregar dueno - permitir Dueno o null para bloqueos
    if (req.body.sanitizeInput.idDueno) {
      const dueno = await em.findOneOrFail(Dueno, { idUsuario: req.body.sanitizeInput.idDueno }, { populate: ['mascotas', 'reservas'] });
      reserva.dueno = dueno;
    }
    console.log("Adding reserva with data:", reserva);

    console.log("Finalizando reserva");
    await em.flush();
    res.status(200).json({ message: "Reserva created", data: reserva });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating reserva", error: error.message });
  }
}

async function authenticateAdd(req: Request, res: Response, next: NextFunction) {
  console.log("Authenticating reserva with data:", req.body.sanitizeInput);
  try {
    const em = orm.em.fork();
    
    const publi = await em.findOneOrFail(Publicacion, { idPublicacion: req.body.sanitizeInput.idPublicacion });
    if (!publi) {
      res.status(400).json({ message: "Publicacion no existe" })
      return;
    }
    console.log("id dueno", req.body.sanitizeInput.idDueno)
    const dueno = await em.findOneOrFail(Dueno, { idUsuario: req.body.sanitizeInput.idDueno });
    if (!dueno) {
      res.status(400).json({ message: "Dueno no existe" })
      return;
    }
    console.log("id mascotas", req.body.sanitizeInput.idMascotas)
    for (const idMascota of req.body.sanitizeInput.idMascotas) {
      const mascota = await em.findOneOrFail(Mascota, { idMascota: idMascota, dueno: req.body.sanitizeInput.idDueno });
      if (!mascota) {
        res.status(400).json({ message: `La mascota con id ${idMascota} no existe o no pertenece al dueno` })
        return;
      }
    }
    next();
  } catch (error: any) {
    res.status(500).json({ message: "Error authenticating reserva", error: error.message });
  }
}



async function update(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const idReserva = Number(req.params.idReserva);
    const reserva = await em.findOneOrFail(Reserva, { idReserva });
    em.assign(reserva, req.body.sanitizeInput);
    await em.flush();
    res.status(200).json({ message: "Reserva updated", data: reserva });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating reserva", error: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const idReserva = Number(req.params.idReserva);

    // Cargar la reserva con sus días reservados
    const reserva = await em.findOneOrFail(Reserva, { idReserva }, {
      populate: ['diasReservados']
    });

    // Eliminar cada DiaReservado primero → libera las fechas
    for (const dia of reserva.diasReservados.getItems()) {
      em.remove(dia);
    }

    // Ahora sí eliminar la reserva
    await em.removeAndFlush(reserva);

    res.status(200).json({ message: 'Reserva removed', data: { idReserva } });
  } catch (error: any) {
    res.status(500).json({ message: 'Error removing reserva', error: error.message });
  }
}

async function testDate(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const dias = [];
    req.body.sanitizeInput.dias.forEach(async (dia: any) => {
      const fecha = Temporal.PlainDate.from(dia);
      dias.push(fecha);
    });
    req.body.sanitizeInput.dias.forEach(async (dia: any) => {
      console.log("Fecha procesada:", dia.toString());
    });
    console.log("Received dates:", req.body.sanitizeInput.dias);
    console.log("Comparing dates:", req.body.sanitizeInput.dias[0], "and", req.body.sanitizeInput.dias[1]);

    if (req.body.sanitizeInput.dias[0] > req.body.sanitizeInput.dias[1]) {
      console.log("Fecha desde es mayor que fecha hasta");
    }
  } catch (error: any) {
    res.status(500).json({ message: "Error testing dates", error: error.message });
  }
}



// ---------------------------------------- STRIPE ---------------------------------------- // 
// PAGO CON STRIPE

import Stripe from 'stripe';


async function testPagoStripe(req: Request, res: Response) {
  console.log("Iniciando test de pago con Stripe");
  // La session de stripe la pedimos con el middleware
  try {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Test Product',
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
      
    ],
    mode: 'payment',
    
/*
    idReserva: req.body.idReserva,
    fechaReserva: req.body.fechaReserva,
    descripcion: req.body.descripcion,
    horaReserva: req.body.horaReserva,
    idDueno: req.body.idDueno,
    idMascotas: req.body.idMascotas,
    idPublicacion: req.body.idPublicacion,
    dias: req.body.dias,

*/
    
    metadata: {
        fechaReserva: req.body.sanitizeInput.fechaReserva,
        descripcion: req.body.sanitizeInput.descripcion,
        horaReserva: req.body.sanitizeInput.horaReserva,
        idDueno: req.body.sanitizeInput.idDueno,
        idMascotas: JSON.stringify(req.body.sanitizeInput.idMascotas),
        idPublicacion: req.body.sanitizeInput.idPublicacion,
        dias: JSON.stringify(req.body.sanitizeInput.dias),
        fechaDesde: req.body.sanitizeInput.fechaDesde,
        fechaHasta: req.body.sanitizeInput.fechaHasta,
      },
       

    success_url: 'http://localhost:3308/payment/success',
    cancel_url: 'http://localhost:3308/payment/cancel',
  });
  res.status(200).json({ session });
  } catch (error) {
    console.error("Error initializing Stripe:", error);
    res.status(500).json({ message: "Error initializing Stripe", error });
    return;
  }
  return;
}

// Webhook de stripe
// La llave la pedimos cuando iniciamos el middleware del webhook
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_ENDPOINT_SECRET;

console.log('🔧 Webhook Stripe configurado con secret:', endpointSecret ? '✅ Presente' : '❌ NO CONFIGURADO');

// // ─── Reemplazar SOLO la función stripeWebHook en reserva.controller.ts ───────
// // El resto del archivo queda igual.
// async function stripeWebHook(req: Request, res: Response) {
//   console.log('=== WEBHOOK DEBUG ===');
//   console.log('Signature recibida:', req.headers['stripe-signature']?   req.headers['stripe-signature'].toString().substring(0, 30) + '...' : 'No signature');
//   console.log('Secret usado:', endpointSecret?.substring(0, 30));
//   console.log('Body length:', req.body?.length);
//   console.log('Secret RAW:', JSON.stringify(process.env.STRIPE_WEBHOOK_SECRET));
//   console.log('Body type:', typeof req.body);
//   console.log('Is Buffer:', Buffer.isBuffer(req.body));
//   console.log('Content-Type:', req.headers['content-type']);
//   console.log('Has signature:', !!req.headers['stripe-signature']);
//   console.log('Secret cargado:', process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 20) + '...');
//   const emWebhook = orm.em.fork();

//   const signature = req.headers['stripe-signature'];

//   if (!signature || !endpointSecret) {
//     res.status(400).json({ error: 'Missing signature or secret' });
//     return;
//   }

//   let event: any;

//   try {
//     event = Stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
//   } catch (err: any) {
//     console.error('❌ Error verificando firma Stripe:', err.message);
//     res.status(400).json({ error: `Webhook Error: ${err.message}` });
//     return;
//   }

//   // ✅ Responder a Stripe INMEDIATAMENTE — antes de cualquier await
//   // Si no respondés en ~30s, Stripe marca el webhook como fallido
//   res.json({ received: true });

//   // Procesar en segundo plano (ya respondimos, no importa cuánto tarde)
//   console.log('✅ Evento Stripe recibido:', event.type);

//   try {
//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object;

//       if (session.payment_status !== 'paid') return;

//       const { fechaReserva, descripcion, idDueno, idMascotas, idPublicacion, dias } = session.metadata || {};

//       if (!idPublicacion || !idDueno || !dias) {
//         console.error('❌ Metadata incompleta:', { idPublicacion, idDueno, dias });
//         return;
//       }

//       const diasArray = JSON.parse(dias);
//       const mascotasArray = idMascotas ? JSON.parse(idMascotas) : [];

//       console.log('💰 Creando reserva — Días:', diasArray, '| Mascotas:', mascotasArray);

//       const publi = await emWebhook.findOneOrFail(Publicacion, { idPublicacion: Number(idPublicacion) });
//       const dueno = await emWebhook.findOneOrFail(Dueno, { idUsuario: Number(idDueno) });

//       const reserva = emWebhook.create(Reserva, {
//         fechaReserva: new Date(fechaReserva || new Date()),
//         descripcion: descripcion || 'Reserva de pago Stripe',
//         publicacion: publi,
//         dueno: dueno
//       } as any);

//       for (const dia of diasArray) {
//         const diaReservado = emWebhook.create(DiaReservado, { fechaReservada: dia, reserva });
//         reserva.diasReservados.add(diaReservado);
//       }

//       for (const idMascota of mascotasArray) {
//         try {
//           const mascota = await emWebhook.findOneOrFail(Mascota, { idMascota: Number(idMascota) });
//           reserva.mascotas.add(mascota);
//         } catch {
//           console.warn(`⚠️ Mascota ${idMascota} no encontrada`);
//         }
//       }

//       await emWebhook.flush();
//       console.log('✅ Reserva creada exitosamente:', reserva.idReserva);
//     }
//   } catch (error: any) {
//     console.error('❌ Error procesando webhook:', error.message);
//   }
// }


async function stripeWebHook(req: Request, res: Response) {
  console.log('🎯 [WEBHOOK] Solicitud recibida en /api/webhook/stripe');
  console.log('📋 Headers:', {
    signature: req.headers['stripe-signature'] ? req.headers['stripe-signature'].toString().substring(0, 20) + '...' : 'AUSENTE',
    contentType: req.headers['content-type']
  });
  console.log('📦 Body type:', typeof req.body, 'Is Buffer:', Buffer.isBuffer(req.body));
  
  if (!endpointSecret) {
    console.error("❌ CRITICAL: STRIPE_WEBHOOK_SECRET not configured in .env");
    console.error("📍 Búsqueda fallida en: process.env.STRIPE_WEBHOOK_SECRET o process.env.STRIPE_ENDPOINT_SECRET");
    res.status(500).json({ error: 'Webhook secret not configured' });
    return;
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    console.error("❌ No signature found en headers");
    console.error("📍 Headers disponibles:", Object.keys(req.headers));
    res.status(400).json({ error: 'No signature found' });
    return;
  }

  let event;
  try {
    console.log('🔐 Verificando firma Stripe...');
    event = Stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    console.log("✅ Evento Stripe verificado correctamente. Tipo:", event.type);
  } catch (err: any) {
    console.error("❌ Error verifying signature:", err.message);
    console.error("📍 Detalles:", err);
    res.status(400).json({ error: `Webhook Error: ${err.message}` });
    return;
  }

  // ⭐ RESPONDER INMEDIATAMENTE
  console.log('📤 Respondiendo con { received: true } al webhook');
  res.json({ received: true });

  // Procesar en segundo plano
  console.log('🔍 Procesando evento:', event.type);
  
  if (event.type === 'checkout.session.completed') {
    console.log('✅ Evento checkout.session.completed detectado');
    const session = event.data.object;
    
    console.log('💳 Metadata de la sesión:', session.metadata);
    console.log('💰 Payment status:', session.payment_status);

    if (session.payment_status !== 'paid') {
      console.log("⚠️ Pago no completado, status:", session.payment_status);
      return;
    }

    const emWebhook = orm.em.fork();

    try {
      console.log("💰 Pago confirmado - Creando reserva");

      const {
        fechaReserva,
        descripcion,
        idDueno,
        idMascotas,
        idPublicacion,
        dias,
        fechaDesde,
        fechaHasta
      } = session.metadata || {};

      if (!idPublicacion || !idDueno || !dias) {
        console.error('❌ Metadata incompleta en webhook');
        console.error('📍 Valores recibidos:', { idPublicacion, idDueno, dias, idMascotas });
        return;
      }

      // ✅ 1. PRIMERO parsear los arrays
      console.log('📊 Parseando datos...');
      const diasArray = JSON.parse(dias);
      const mascotasArray = idMascotas ? JSON.parse(idMascotas) : [];
      console.log('📅 Días a reservar:', diasArray);
      console.log('🐾 Mascotas:', mascotasArray);

      // ✅ 2. SEGUNDO buscar las entidades
      const publi = await emWebhook.findOneOrFail(Publicacion, {
        idPublicacion: Number(idPublicacion)
      });

      const dueno = await emWebhook.findOneOrFail(Dueno, {
        idUsuario: Number(idDueno)
      });

      // ✅ 3. TERCERO crear la reserva (ahora publi y dueno existen)
      const reserva = emWebhook.create(Reserva, {
        fechaReserva: fechaReserva ? new Date(fechaReserva) : new Date(),
        fechaDesde: new Date(fechaDesde),
        fechaHasta: new Date(fechaHasta),
        descripcion: descripcion || 'Reserva de pago Stripe',
        publicacion: publi,  // ← Ahora sí existe
        dueno: dueno         // ← Ahora sí existe
      } as any);

      // ✅ 4. Agregar días reservados (vinculados a reserva Y publicacion)
      for (const dia of diasArray) {
        const diaReservado = emWebhook.create(DiaReservado, {
          fechaReservada: dia,
          reserva: reserva,
          publicacion: publi  // ← Vincula a la publicación
        });
        reserva.diasReservados.add(diaReservado);
      }

      // ✅ 5. Agregar mascotas
      for (const idMascota of mascotasArray) {
        try {
          const mascota = await emWebhook.findOneOrFail(Mascota, {
            idMascota: Number(idMascota)
          });
          reserva.mascotas.add(mascota);
        } catch (err) {
          console.warn(`⚠️ Mascota ${idMascota} no encontrada`);
        }
      }

      // ✅ 6. Guardar todo
      await emWebhook.flush();
      console.log('✅ Reserva creada exitosamente:', reserva.idReserva);

    } catch (error: any) {
      console.error("❌ Error creando reserva:", error.message);
      console.error("Stack:", error.stack);
      console.error("Error completo:", error);
    }
  } else {
    console.log('⏭️ Evento no procesado (tipo:', event.type, '). Solo se procesan: checkout.session.completed');
  }
}

// async function addWebHook(fechaReserva: string, descripcion: string, horaReserva: string, idDueno: string, idMascotas: any, idPublicacion: string, dias: any) {

//   try {
//     let reserva = {
//             idReserva: undefined,
//             fechaReserva: fechaReserva,
//             descripcion: descripcion,
//             horaReserva: Date(now()),
//             idDueno: undefined,
//             idMascotas: idMascotas,
//             idPublicacion: Number(idPublicacion),
//             dias: dias,
//           }
//     console.log("Creating reserva from webhook with data:", reserva);
//     console.log("Parametros", fechaReserva, descripcion, horaReserva, idDueno, idMascotas, idPublicacion, dias);

//     //Agregar dueno - permitir Dueno o null para bloqueos
//       const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion: Number(idPublicacion) });
//       const dueno = await em.findOneOrFail(Dueno, { idUsuario: Number(idDueno) }, { populate: ['mascotas', 'reservas'] });
//       const reservaEntity = em.create(Reserva, {
//         fechaReserva,      // String o convertir: new Date(fechaReserva)
//         descripcion,
//         publicacion,       // ✅ Entidad completa
//         dueno,            // ✅ Entidad completa
//         dias: dias
//         // NO incluir idReserva
//         // NO incluir idDueno, idPublicacion (ya están en las relaciones)
//       });
//     console.log("Agregar dias reservados")
//     //Agregar dias reservados
//     dias.forEach(async (dia: any) => {
//       const diaReservado = em.create(DiaReservado, { fechaReservada: dia, reserva: reserva },);
//       reservaEntity.diasReservados.add(diaReservado);
//     })

//     console.log("Agregar mascotas")
//     //Agregar mascotas - solo si se proporcionan
//     if (req.body.sanitizeInput.idMascotas && req.body.sanitizeInput.idMascotas.length > 0) {
//       req.body.sanitizeInput.idMascotas.forEach(async (idMascota: number) => {
//         const mascota = await em.findOneOrFail(Mascota, { idMascota: idMascota, dueno: req.body.sanitizeInput.idDueno });
//         reserva.mascotas.add(mascota);
//       })
//     }

//     console.log("Agregar publicacion")
//     //Agregar publicacion
    
//     reserva.publicacion = publi;
//     publi.reservas.add(reserva)

//     console.log("Agregar dueno")
    
//     console.log("Adding reserva with data:", reserva);

//     console.log("Finalizando reserva");
//     await em.flush();
//     res.status(200).json({ message: "Reserva created", data: reserva });
//   } catch (error: any) {
//     res.status(500).json({ message: "Error creating reserva", error: error.message });
//   }
// }







export { sanitizeReserva, findAll, findOne, add, update, remove, authenticateAdd, testDate, verifyDate, stripeWebHook, testPagoStripe };