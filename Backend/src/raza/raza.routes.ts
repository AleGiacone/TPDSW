import { Router } from 'express';
import {
  sanitizeRaza,
  findAll,
  findOne,
  add,
  update,
  remove,
} from './raza.controller.js';

export const razaRouter = Router();

razaRouter.get('/', findAll);
razaRouter.get('/:idRaza', findOne);
razaRouter.post('/', sanitizeRaza, add);
razaRouter.put('/:idRaza', update);
razaRouter.delete('/:idRaza', remove);
