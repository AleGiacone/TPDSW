import { Request, Response } from "express";
import { Router } from 'express';
import { sanitizeCuidador, findAll, findOne, add, update, remove } from './cuidador.controller.js';

export const cuidadorRouter = Router();

cuidadorRouter.get("/", findAll);
cuidadorRouter.get("/:idUsuario", findOne);
cuidadorRouter.post("/", sanitizeCuidador, add);
cuidadorRouter.put("/:idUsuario", sanitizeCuidador, update);
cuidadorRouter.patch("/:idUsuario", sanitizeCuidador, update);
cuidadorRouter.delete("/:idUsuario", remove);

