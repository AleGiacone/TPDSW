import { Router } from 'express';
import { sanitizeUsuario, findAll, findOne, add, update, remove, loginCtrl } from './usuario.controller.js';
import { appendFile } from 'fs';

export const usuarioRouter = Router();

usuarioRouter.post('/login', sanitizeUsuario, loginCtrl);
usuarioRouter.get('/', findAll);
usuarioRouter.get('/:idUsuario', findOne);

usuarioRouter.post('/', sanitizeUsuario, add);
usuarioRouter.put('/:idUsuario', sanitizeUsuario, update);
usuarioRouter.patch('/:idUsuario', sanitizeUsuario, update);
usuarioRouter.delete('/:idUsuario', remove);  