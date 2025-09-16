import { Router, RequestHandler } from 'express';
import {
  sanitizeRaza,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './raza.controller.js';

export const razaRouter = Router();

<<<<<<< HEAD
razaRouter.get('/', findAll);
razaRouter.get('/:idRaza', findOne);
razaRouter.post('/', sanitizeRaza, add);
razaRouter.patch('/:idRaza', sanitizeRaza, update);
razaRouter.put('/:idRaza', update);
razaRouter.delete('/:idRaza', remove);
=======
// Cast todas las funciones como RequestHandler para evitar problemas de tipos
razaRouter.get('/', findAll as RequestHandler);
razaRouter.get('/:idRaza', findOne as RequestHandler);
razaRouter.post('/', sanitizeRaza as RequestHandler, add as RequestHandler);
razaRouter.put('/:idRaza', sanitizeRaza as RequestHandler, update as RequestHandler);
razaRouter.delete('/:idRaza', remove as RequestHandler);
>>>>>>> 96a01422714203c35f313b5a33bbbca69e853748
