import { Router } from 'express';
import { authMiddleware, sanitizeUsuario, findAll, findOne, add, update, remove, loginCtrl, uploadFiles } from './usuario.controller.js';
import { appendFile } from 'fs';

export const usuarioRouter = Router();

import multer from 'multer';
const upload = multer({ dest: './public/img/perfilImages' });


usuarioRouter.post('/', sanitizeUsuario, loginCtrl);
usuarioRouter.get('/', findAll);
usuarioRouter.get('/:id', findOne);
usuarioRouter.get('/usuario/me', authMiddleware);
usuarioRouter.post('/register', sanitizeUsuario, add);
usuarioRouter.put('/:email', sanitizeUsuario, update);
usuarioRouter.patch('/:email', sanitizeUsuario, update);
usuarioRouter.delete('/:email', remove);
usuarioRouter.post('/upload-image', upload.single('imageFile'), uploadFiles, add);

