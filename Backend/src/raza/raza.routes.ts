import { Router, RequestHandler } from 'express';
import {
  sanitizeRaza,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './raza.controller.js';
import { adminAuthenticate } from '../admin/admin.controller.js';

export const razaRouter = Router();

// Cast todas las funciones como RequestHandler para evitar problemas de tipos
razaRouter.get('/', findAll as RequestHandler);
razaRouter.get('/:idRaza', findOne as RequestHandler);
razaRouter.post('/', adminAuthenticate, sanitizeRaza as RequestHandler, add as RequestHandler);
razaRouter.put('/:idRaza', adminAuthenticate, sanitizeRaza as RequestHandler, update as RequestHandler);
razaRouter.delete('/:idRaza', adminAuthenticate, remove as RequestHandler);
