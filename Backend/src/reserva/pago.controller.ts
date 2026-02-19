import { Request, Response, NextFunction } from 'express';
import { Pago } from './pago.entity.js';
import { orm } from '../shared/db/orm.js';
import sanitizeHTML from 'sanitize-html';
// Ver como hacer el tema de pago, si implementar un medio de pago real o dejar

function sanitizePago(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeInput = {
    idPago: sanitizeHTML(req.body.idPago),
    idReserva: sanitizeHTML(req.body.idReserva),
    monto: parseFloat(sanitizeHTML(req.body.monto)),
    fechaPago: sanitizeHTML(req.body.fechaPago)
  };
  Object.keys(req.body.sanitizeInput).forEach((key) => {
    if (req.body.sanitizeInput[key] === undefined) {
      delete req.body.sanitizeInput[key];
    }
  });
  next();
}


async function findAll(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const pagos = await em.find(Pago, {});
    res.status(200).json({ message: 'Found all pagos', data: pagos });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving pagos" });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const idPago = Number(req.params.idPago);
    const pago = await em.findOneOrFail(Pago, { idPago });
    res.status(200).json({ message: 'Pago found', data: pago });
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving pago" });
  }
}

async function add(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const pago = em.create(Pago, req.body.sanitizeInput);
    await em.flush();
    res.status(200).json({ message: 'Pago created', data: pago });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating pago" });
  }
}

async function update(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const idPago = Number.parseInt(req.params.idPago as string);
    const pago = await em.findOneOrFail(Pago, { idPago });
    em.assign(pago, req.body.sanitizeInput);
    await em.flush();
    res.status(200).json({ message: 'Pago updated', data: pago });
  } catch (error: any) {
    res.status(500).json({ message: "Error updating pago" });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const em = orm.em.fork();
    const idPago = Number.parseInt(req.params.idPago as string);
    const pago = await em.findOneOrFail(Pago, { idPago });
    await em.removeAndFlush(pago);
    res.status(200).json({ message: 'Pago removed', data: pago });
  } catch (error: any) {
    res.status(500).json({ message: "Error removing pago" });
  }
}


// Testeo pago Stripe

export { sanitizePago, findAll, findOne, add, update, remove};