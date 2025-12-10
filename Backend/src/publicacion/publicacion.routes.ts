import { Router } from 'express';
import { sanitizePublicacion, findAll, findOne, findByCuidador, add, update, remove, getDiasReservados } from './publicacion.controller.js';
import { publicacionImageUpload } from '../shared/multer.config.js';

export const publicacionRouter = Router();

// FindAll
publicacionRouter.get("/", findAll);
// Buscar por cuidador
publicacionRouter.get("/cuidador/:idUsuario", findByCuidador);
// Buscar por idPublicacion
publicacionRouter.get("/:idPublicacion", findOne);
// Buscar los dias reservados de una publicacion por idPublicacion
publicacionRouter.get("/dias-reservados/:idPublicacion", getDiasReservados);
// Añadir una publcacion
publicacionRouter.post("/", publicacionImageUpload, sanitizePublicacion, add);
// Actualizar una publicacion
publicacionRouter.put('/:idPublicacion', publicacionImageUpload, sanitizePublicacion, update);
// Alternativa para actualizar una publicacion
publicacionRouter.patch("/:idPublicacion", sanitizePublicacion, update);
// Eliminar una publicacion
publicacionRouter.delete("/:idPublicacion", remove);
