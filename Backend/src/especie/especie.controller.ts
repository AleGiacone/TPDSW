import {Request, Response, NextFunction} from 'express';
import { Especie } from './especie.entity.js';
import { orm } from '../shared/db/orm.js';



function sanitizeEspecie(req: Request, res: Response, next: NextFunction) {
  console.log("Sanitizing especie with body:", req.body);
  console.log("Nombre especie:", req.body.nomEspecie);
  req.body.sanitizeInput = {
    nomEspecie: req.body.nomEspecie,
  };
// cambiar el object keys
  // Object.keys(req.body.sanitizeInput).forEach((key) => { 
  //   if (req.body.sanitizeInput[key] === undefined) {
  //     delete req.body.sanitizeInput[key];
  //   }
    
  // });
  next()
}

const em = orm.em

async function findAll(req: Request, res: Response){
  try { 
    // Tipo de retorno promise
      const especies = await em.find (Especie, {}, {populate : ['razas']})
      res.status(200).json ({message: 'finded all especies', data: especies })
  } catch (error: any) {
    res.status(500).json({ message: "Error retrieving especies", error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try{
    const idEspecie = Number(req.params.idEspecie)
    const especie= await em.findOneOrFail (Especie , {idEspecie} , { populate : ['razas']});
    res.status(200).json({ message: 'Especie found', data: especie });
  } catch (error:any){
    res.status(500).json({ message: "Error retrieving especie", error: error.message });
}
}

async function add(req: Request, res: Response) {
  console.log("Adding especie with data:", req.body.sanitizeInput);
  try {
    const especie = em.create(Especie, req.body.sanitizeInput);
    await em.flush()
    res.status(200).json({ message: 'Especie created', data: especie });
  } catch (error: any) {
    res.status(500).json({ message: "Error creating especie", error: error.message });
  }
  
}

async function update(req: Request, res: Response) {
  try{
    const idEspecie = Number.parseInt (req.params.idEspecie);
    const especie = await em.findOneOrFail( Especie, {idEspecie} );
    // Traquea
    em.assign(especie, req.body.sanitizeInput)
    await em.flush()
    res.status(200).json ({ message: "idEspecie updated", especie})
    
  } catch (error:any) {
    res.status(500).json ({message : error.message})
  }
}

async function remove (req: Request, res: Response) {
 try {
   const idEspecie = Number.parseInt (req.params.idEspecie)
   const especie = await em.findOneOrFail (Especie, {idEspecie} )
   await em.removeAndFlush (especie)
   res.status(200).send ({message:"se fue"})
   //em.nativeDelete(especie ,{idEspecie})
 } catch (error:any){
 res.status(500).json ({message: error.message})
 }
}

export { sanitizeEspecie, findAll, findOne, add, update, remove };