import {Request, Response, NextFunction} from 'express';
import { Raza } from './raza.entity.js';
import { orm } from '../shared/db/orm.js';
import { OneToMany } from '@mikro-orm/core';
import { RequestContext } from "@mikro-orm/core";
import { Especie} from '../especie/especie.entity.js';

function sanitizeRaza(req: Request, res: Response, next: NextFunction) {
  console.log('req.body completo:', req.body);
  console.log('req.body.especie:', req.body.especie, typeof req.body.especie);
  console.log('req.body.idEspecie:', req.body.idEspecie, typeof req.body.idEspecie);
  const especieValue = req.body.especie || req.body.idEspecie;
  
  if (!especieValue) {
    return res.status(400).json({ 
      message: 'Campo especie es requerido',
      received: req.body
    });
  }
  
  req.body.sanitizeInput = {
    idRaza: req.body.idRaza,
    nomRaza: req.body.nomRaza, // string
    especie: parseInt(especieValue), // para la relación ManyToOne con Especie
  };
  
  console.log('Datos sanitizados:', req.body.sanitizeInput);
  
  // Verificar que el parseInt funcionó
  if (isNaN(req.body.sanitizeInput.especie)) {
    return res.status(400).json({ 
      message: 'El campo especie debe ser un número válido',
      received: especieValue
    });
  }
  
  next();
}

const em = orm.em

async function findAll(req: Request, res: Response) {
  try {
    const razas = await em.find(Raza, {}, { populate: ['especie'] });
    const razasFormateadas = razas.map(raza => ({
      id: raza.idRaza,
      idRaza: raza.idRaza,
      nombre: raza.nomRaza,
      nomRaza: raza.nomRaza,
      idEspecie: raza.especie?.idEspecie || null, 
      especie: raza.especie || null 
    }));
    
    res.status(200).json({ 
      message: 'found all razas', 
      data: razasFormateadas 
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: "Error retrieving razas", 
      error: error.message 
    });
  }
}

async function add(req: Request, res: Response): Promise<void> {
  try {
    const especie = await em.findOne(Especie, { idEspecie: req.body.sanitizeInput.especie });
    
    if (!especie) {
      res.status(404).json({ message: 'Especie not found' });
      return;
    }
    const raza = new Raza();
    raza.nomRaza = req.body.sanitizeInput.nomRaza;
    raza.especie = especie;
    
    em.persist(raza);
    await em.flush();
  
    await em.populate(raza, ['especie']);
    
    res.status(201).json({ message: 'Raza created', data: raza });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating raza", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try{
    const idRaza = Number.parseInt (req.params.idRaza)
    const raza = await em.findOneOrFail (Raza , {idRaza}, {populate : ['especie']});
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