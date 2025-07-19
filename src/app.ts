import 'reflect-metadata'
import express from "express";
import {especieRouter} from "./especie/especie.routes.js";
import { razaRouter } from './raza/raza.routes.js';
// Instala los Especies con: pnpm add -D @types/express

import { orm, syncSchema } from "./shared/db/orm.js";
import { RequestContext } from '@mikro-orm/core';

const app = express();
app.use(express.json());

//Luego de los middlewares base

app.use((req,res,next) => {
  RequestContext.create(orm.em, next)
});
//Antes de las rutas y middlewares de negocio


app.use("/api/especies", especieRouter);
app.use("/api/razas", razaRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Pet API!");
});


app.use((_, res) => {
  res.status(404).send({ message: "Not Found" });
  return;  
})

app.use((_, res) => {
  res.status(404).send({ message: "Not Found" });
  return;  
})

const PORT = process.env.PORT || 3000;

await syncSchema(); //Never in production


app.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
