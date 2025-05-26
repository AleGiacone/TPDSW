import express from "express";
import {tipoRouter} from "./tipo/tipo.routes.js";
// Instala los tipos con: pnpm add -D @types/express

const app = express();

app.use(express.json());

app.use("/api/tipos", tipoRouter);

app.use((_, res) => {
  res.status(404).send({ message: "Not Found" });
  return;  
})

app.use((_, res) => {
  res.status(404).send({ message: "Not Found" });
  return;  
})

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
