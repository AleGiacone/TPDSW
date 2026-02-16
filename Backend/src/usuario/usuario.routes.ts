import { Router } from 'express';
import { authMiddleware, sanitizeUsuario, findAll, findOne, add, update, remove, loginCtrl, uploadFiles, setupTwoFactor, codeValidation } from './usuario.controller.js';
import { appendFile } from 'fs';

export const usuarioRouter = Router();

import multer from 'multer';
const upload = multer({ dest: './public/img/perfilImages' });


usuarioRouter.post('/', sanitizeUsuario, loginCtrl);
usuarioRouter.post('/register', sanitizeUsuario, add);
usuarioRouter.get('/usuario/me', authMiddleware);
usuarioRouter.get('/', findAll); //Poner verificaicon para obtener all
usuarioRouter.get('/:id', authMiddleware, findOne);
usuarioRouter.put('/:email', authMiddleware, sanitizeUsuario, update);
usuarioRouter.patch('/:email', authMiddleware, sanitizeUsuario, update);
usuarioRouter.delete('/:email', authMiddleware, remove);
usuarioRouter.post('/upload-image', upload.single('imageFile'), uploadFiles, add);

// 2FA

usuarioRouter.post('/2fa/generate', setupTwoFactor)
usuarioRouter.post('/2fa/validate', codeValidation)

