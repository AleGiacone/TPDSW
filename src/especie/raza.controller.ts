import {Request, Response, NextFunction} from 'express';
import { Raza } from './raza.entity.js';
import { orm } from '../shared/db/orm.js';
import { OneToMany } from '@mikro-orm/core';
import { RequestContext } from "@mikro-orm/core";

function sanitizeRaza(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizeInput = {
    idRaza: req.body.idRaza,
    nomRaza: req.body.nomRaza,
    especie: req.body.especie
  };

  Object.keys(req.body.sanitizeInput).forEach((key) => { 
    if (req.body.sanitizeInput[key] === undefined) {
      delete req.body.sanitizeInput[key];
    }
  });
  next()
}

const em = orm.em


async function findAll(req: Request, res: Response){
  try { 
    // Tipo de retorno promise
      const razas = await em.find (Raza, {} , {populate : ['especies']})
      res.status(200).json ({message: 'finded all razas', data: razas })
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving razas", error: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const data = req.body;
    const raza = em.create(Raza, data);
    await em.flush()
    res.status(200).json({ message: 'Raza created', data: raza });
    } catch (error: any) {
    res.status(500).json({ message: "Error creating raza", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try{
    const idRaza = Number.parseInt (req.params.idRaza)
    const raza = await em.findOneOrFail (Raza , {idRaza}, {populate : ['especies']});
    res.status(200).json({ message: 'Raza found', data: raza });
  } catch (error:any){
    res.status(500).json({ message: "Error retrieving raza", error: error.message });
  } 
}
  
async function update(req: Request, res: Response) {
  try{
    const em = RequestContext.getEntityManager()!;
    const idRaza = Number.parseInt(req.params.idRaza);
    console.log("idRaza", idRaza)
    const raza = await em.findOneOrFail(Raza, {idRaza} );
    em.assign( raza, req.body)
    await em.flush()
    res.status(200).json({ message: 'Raza updated', data: raza });
  } catch (error:any){
    console.error(error.stack);

    res.status(500).json({ message: "Error updating raza", error: error.message });
  }
}

async function remove (req: Request, res: Response) {
  try {
    const idRaza = Number.parseInt (req.params.idRaza)
    const raza = await em.findOneOrFail (Raza, {idRaza})
    await em.removeAndFlush (raza)
    res.status(200).send ({message:"se fue"})
    //em.nativeDelete(raza , {idRaza})
  } catch (error:any){
  res.status(500).json ({message: error.message})
  }
 }
 

export { sanitizeRaza, findAll, findOne, add, update, remove };