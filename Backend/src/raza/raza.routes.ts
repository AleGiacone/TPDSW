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

// Cast todas las funciones como RequestHandler para evitar problemas de tipos
razaRouter.get('/', findAll as RequestHandler);
razaRouter.get('/:idRaza', findOne as RequestHandler);
razaRouter.post('/', sanitizeRaza as RequestHandler, add as RequestHandler);
razaRouter.put('/:idRaza', sanitizeRaza as RequestHandler, update as RequestHandler);
razaRouter.delete('/:idRaza', remove as RequestHandler);