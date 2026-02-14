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

    const reservas = await em.find(Reserva, {}, { populate: ["dueno", "mascotas", "diasReservados"] });
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


    const dias: Temporal.PlainDate[] = [];
    const publicacion = await em.findOneOrFail(Publicacion, { idPublicacion: req.body.sanitizeInput.idPublicacion }, { populate: ['reservas'] });

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


    console.log("Dias ya reservados en la publicacion:", diasReservados);

    for (let dia of req.body.sanitizeInput.dias) {
      console.log("Procesando dia:", Temporal.PlainDate.from(dia).toString());
      if (diasReservados.includes(Temporal.PlainDate.from(dia).toString())) {
        res.status(400).json({ message: `La fecha ${Temporal.PlainDate.from(dia).toString()} ya está reservada en la publicación.` });
        return;
      }
    }
  } catch (error: any) {
    res.status(500).json({ message: "Error verifying dates", error: error.message });
  }
  next();
}




async function add(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
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
    const reserva = await em.findOneOrFail(Reserva, { idReserva });
    await em.removeAndFlush(reserva);
    res.status(200).json({ message: "Reserva removed", data: reserva });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing reserva", error: error.message });
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
  console.log("Datos recibidos para el pago:", req.body.sanitizeInput.dias);
  console.log("Datos recibido del id de las mascotas", req.body.sanitizeInput.idMascotas);
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
      },
       


    success_url: 'http://localhost:3307/dashboards/dueno',
    cancel_url: 'https://example.com/cancel',
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
const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

async function stripeWebHook(req: Request, res: Response) {
  console.log("🔔 WEBHOOK RECIBIDO");
  console.log("🔑 endpointSecret definido?", !!endpointSecret);
  console.log("📦 Body type:", typeof req.body, Buffer.isBuffer(req.body) ? "(Buffer)" : "");
  // Usamos un EntityManager forkeado para este webhook,
  // evitando el uso del contexto global (requerido por MikroORM 6).
  const emWebhook = orm.em.fork();
  let event;
  
  if (endpointSecret) {
    // Get the signature sent by Stripe
    console.log ("Stripe signature", req.headers['stripe-signature']);
    const signature = req.headers['stripe-signature'];
    
    if (!signature) {
     res.status(400).send('No signature found');
     return;
    }
    try {
      console.log("ESTOY EN TRY OMO");
      const event = Stripe.webhooks.constructEvent(
        req.body,
        signature,
        endpointSecret
      );

  // ✅ Ahora TypeScript sabe que event existe
    console.log("Handling Stripe event:", event.type);
  
  switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
  
      const { fechaReserva, descripcion, idDueno, idMascotas, idPublicacion, dias } = session.metadata || {};
      
      if (session.payment_status === 'paid') {
        try {
          console.log("💰 Pago confirmado - Creando reserva");
          
          // Validar que tenemos los datos necesarios
          if (!idPublicacion || !idDueno || !dias) {
            console.error("❌ Datos incompletos en metadata:", { idPublicacion, idDueno, dias });
            break;
          }

          // Parsear datos que vienen como strings
          const diasArray = typeof dias === 'string' ? JSON.parse(dias) : [];
          const mascotasArray = typeof idMascotas === 'string' ? JSON.parse(idMascotas) : [];

          console.log("Días a reservar:", diasArray);
          console.log("Mascotas a reservar:", mascotasArray);

          // Obtener entidades requeridas
          const publi = await emWebhook.findOneOrFail(Publicacion, { 
            idPublicacion: Number(idPublicacion) 
          });
          console.log("✅ Publicación encontrada:", publi.idPublicacion);

          const dueno = await emWebhook.findOneOrFail(Dueno, { 
            idUsuario: Number(idDueno) 
          });
          console.log("✅ Dueño encontrado:", dueno.idUsuario);

          // Crear reserva con las propiedades correctas
          // Nota: casteamos a any para que TypeScript no exija idReserva,
          // ya que es una primary key autoincremental manejada por la BD.
          const reserva = emWebhook.create(Reserva, {
            fechaReserva: new Date(fechaReserva || new Date()),
            descripcion: descripcion || 'Reserva de pago Stripe',
            publicacion: publi,
            dueno: dueno
          } as any);

          console.log("✅ Reserva creada en memoria");

          // Agregar días reservados
          if (diasArray && diasArray.length > 0) {
            for (const dia of diasArray) {
              const diaReservado = emWebhook.create(DiaReservado, { 
                fechaReservada: dia, 
                reserva: reserva 
              });
              reserva.diasReservados.add(diaReservado);
            }
            console.log("✅ Días agregados:", diasArray.length);
          }

          // Agregar mascotas
          if (mascotasArray && mascotasArray.length > 0) {
            for (const idMascota of mascotasArray) {
              try {
                const mascota = await emWebhook.findOneOrFail(Mascota, { 
                  idMascota: Number(idMascota)
                });
                reserva.mascotas.add(mascota);
              } catch (err) {
                console.warn(`⚠️ Mascota ${idMascota} no encontrada, continuando...`);
              }
            }
            console.log("✅ Mascotas agregadas");
          }

          console.log("📝 Antes de flush");
          await emWebhook.flush();
          
          console.log("✅ Reserva creada exitosamente:", reserva.idReserva);
          
        }
        catch (error: any) {
          console.error("❌ Error creando reserva desde webhook:", error.message);
          console.error("Stack:", error.stack);
        }
      }
  
        
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log("PaymentIntent was successful:", paymentIntent.id);
        break;

      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        console.log("PaymentMethod attached");
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
    return;
  } catch (err) {
    console.log("Error constructing Stripe event:", err);
    res.status(400);
    return;
  }


  // Return a response to acknowledge receipt of the event
  res.json({received: true});
  return;
}}


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