import { Mascota } from "./mascota.entity.js";
import { EntityManager } from "@mikro-orm/core";
import { Especie } from "../especie/especie.entity.js";
import { Raza } from "../raza/raza.entity.js";
import { Dueno } from "../dueno/dueno.entity.js";
import { Usuario } from "../usuario/usuario.entity.js";

const mascotasData = [
  {
    idMascota: 2,
    nomMascota: 'Hedwig',
    edad: "5",
    sexo: 'Macho',
    exotico: false,
    idEspecie: 4,
    idRaza: 1,
    peso: 3,
    descripcion: 'Búho blanco y hermoso',
    dueno: 3
  },
  {
    idMascota: 1,
    nomMascota: 'Buttercup ',
    edad: "3",
    sexo: 'Hembra',
    exotico: false,
    idEspecie: 2,
    idRaza: 16,
    peso: 5,
    descripcion: 'Gato gordo y mala onda',
    dueno: 4
  },
  {
    idMascota: 3,
    nomMascota: 'Lady',
    edad: "2",
    sexo: 'Hembra',
    exotico: false,
    idEspecie: 6,
    idRaza: 1,
    peso: 50,
    descripcion: 'Cabra juguetona y amigable',
    dueno: 4
  }
]

export const seedMascotas = async (em: EntityManager): Promise<void> => {
  for (const data of mascotasData) {
    const mascotaExistente = await em.findOne(Mascota, { nomMascota: data.nomMascota });
    if (mascotaExistente) {
      console.log(`⚠️ La mascota ${data.nomMascota} ya existe. Saltando...`);
      continue;
    }
    const especie = await em.findOne(Especie, { idEspecie: data.idEspecie });
    const raza = await em.findOne(Raza, { idRaza: data.idRaza });
    const dueno = await em.findOne(Dueno, { idUsuario: data.dueno });
    console.log(`Buscando especie con id ${data.idEspecie}:`, especie);
    console.log(`Buscando raza con id ${data.idRaza}:`, raza);
    console.log(`Buscando dueño con id ${data.dueno}:`, dueno);
    if (!especie || !raza || !dueno) {
      console.warn(`⚠️ No se pudo encontrar la especie, raza o dueño para la mascota ${data.nomMascota}. Saltando...`);
      continue;
    }
    em.flush()
    const mascota = em.create(Mascota, { ...data, especie, raza, dueno });
    em.persist(mascota);
    console.log(`✅ Mascota ${data.nomMascota} creada correctamente`);
  }
}