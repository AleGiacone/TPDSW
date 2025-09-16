import { Router} from 'express';
import { add, remove, update, removeMascotaImage } from './imagenes.controller.js';

const imagenRouter = Router();

imagenRouter.post("/", add);
imagenRouter.put("/:idImagen", update);
imagenRouter.delete("/:idImagen", remove);

// Ruta adicional para eliminar imagen de mascota (por si la quieres usar directamente)
imagenRouter.delete("/mascota/:idMascota", removeMascotaImage);

export { imagenRouter };