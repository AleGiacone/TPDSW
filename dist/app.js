import 'reflect-metadata';
import express from "express";
import { especieRouter } from "./especie/especie.routes.js";
import { razaRouter } from './especie/raza.routes.js';
// Instala los Especies con: pnpm add -D @types/express
import { orm, syncSchema } from "./shared/db/orm.js";
import { RequestContext } from '@mikro-orm/mysql';
const app = express();
app.use(express.json());
//Luego de los middlewares base
app.use((req, res, next) => {
    RequestContext.create(orm.em, next);
});
//Antes de las rutas y middlewares de negocio
app.use("/api/especies", especieRouter);
app.use("/api/razas", razaRouter);
app.use((_, res) => {
    res.status(404).send({ message: "Not Found" });
    return;
});
app.use((_, res) => {
    res.status(404).send({ message: "Not Found" });
    return;
});
await syncSchema(); //Never in production
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
//# sourceMappingURL=app.js.map