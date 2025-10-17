import { Router} from 'express';
import { add, remove, update, removeMascotaImage } from './imagenes.controller.js';

const imagenRouter = Router();

imagenRouter.post("/", add);
imagenRouter.put("/:idImagen", update);
imagenRouter.delete("/:idImagen", remove);
imagenRouter.delete("/mascota/:idMascota", removeMascotaImage);

export { imagenRouter };