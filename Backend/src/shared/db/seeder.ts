import { EntityManager } from "@mikro-orm/core";
import { seedEspecies } from "../../especie/especie.seeder.js";
import { seedDuenos } from "../../dueno/dueno.seeder.js";
import { seedCuidadores } from "../../cuidador/cuidador.seeder.js";
import { seedMascotas } from "../../mascota/mascota.seeder.js";
import { seedPublicaciones } from "../../publicacion/publicacion.seeder.js";
import { seedReservas } from "../../reserva/reserva.seeder.js";

/*
export const runSeeders = async (em: EntityManager): Promise<void> => {
  console.log("🌱 Ejecutando seeders...");
  await seedEspecies(em);
  console.log("🌱 Seeders Especies");
  await seedDuenos(em);
  console.log("🌱 Seeders Duenos");
  await seedCuidadores(em);
  console.log("🌱 Seeders Cuidadores");
  await seedMascotas(em);
  console.log("🌱 Seeders Mascotas");
  await seedPublicaciones(em);
  console.log("🌱 Seeders Publicaciones");
  await seedReservas(em);
  console.log("🌱 Seeders Reservas");
};*/