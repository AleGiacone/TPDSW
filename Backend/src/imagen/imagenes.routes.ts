import { Router} from 'express';
import { add, remove, update, } from './imagenes.controller.js';

const imagenRouter = Router();

imagenRouter.post("/", add);
imagenRouter.put("/:idImagen", update);
imagenRouter.delete("/:idImagen", remove);

export { imagenRouter }