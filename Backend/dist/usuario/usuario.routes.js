import { Router } from 'express';
import { sanitizeUsuario, findAll, findOne, add, update, remove, loginCtrl, uploadFiles } from './usuario.controller.js';
export const usuarioRouter = Router();
import multer from 'multer';
const upload = multer({ dest: './public/img/perfilImages' });
usuarioRouter.post('/login', sanitizeUsuario, loginCtrl);
usuarioRouter.get('/', findAll);
usuarioRouter.get('/:email', findOne);
usuarioRouter.post('/', sanitizeUsuario, add);
usuarioRouter.put('/:email', sanitizeUsuario, update);
usuarioRouter.patch('/:email', sanitizeUsuario, update);
usuarioRouter.delete('/:email', remove);
usuarioRouter.post('/upload-image', upload.single('imageFile'), uploadFiles, add);
//# sourceMappingURL=usuario.routes.js.map