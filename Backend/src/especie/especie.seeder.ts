import { EntityManager } from "@mikro-orm/core";
import { Especie } from "./especie.entity.js";
import { Raza } from "../raza/raza.entity.js";

const especiesData = [
  {
    nomEspecie: "Perro",
    razas: ["Sin raza", "Labrador", "Golden Retriever", "Bulldog", "Beagle", "Poodle", "Chihuahua", "Dachshund", "Boxer", "Shih Tzu", "Yorkshire Terrier"],
  },
  {
    nomEspecie: "Gato",
    razas: ["Sin raza", "Siamés", "Persa", "Maine Coon", "Bengalí", "Ragdoll", "Sphynx", "Abisinio", "Scottish Fold", "Siberiano", "Exótico de Pelo Corto"],
  },
  {
    nomEspecie: "Conejo",
    razas: ["Sin raza", "Holland Lop", "Mini Rex", "Lionhead", "Dutch"],
  },
  {
    nomEspecie: "Ave",
    razas: ["Sin raza", "Canario", "Periquito", "Cacatúa", "Agapornis", "Loro", "Hornero", "Gorrión", "Paloma"],
  },
  {
    nomEspecie: 'Buho',
    razas: ['Sin raza', 'Búho real', 'Búho nival', 'Búho cornudo', 'Búho de orejas cortas', 'Búho de anteojos', 'Búho chico', 'Búho de madriguera']
  },
  {
    nomEspecie: 'Cabra',
    razas: ['Sin raza', 'Cabra montés', 'Cabra doméstica', 'Cabra de los Pirineos', 'Cabra de Angora', 'Cabra de los Alpes']
  }
];

export const seedEspecies = async (em: EntityManager): Promise<void> => {
  try {
  for (const data of especiesData) {
    // Si ya existe la especie, la saltea para evitar duplicados
    const existe = await em.findOne(Especie, { nomEspecie: data.nomEspecie });
    if (existe) continue;

    const especie = em.create(Especie, { nomEspecie: data.nomEspecie });

    for (const nomRaza of data.razas) {
      em.create(Raza, { nomRaza, especie });
    }
  }
  } catch (error) {
    console.error("Error al cargar las especies y razas:", error);
  }
  await em.flush();
  console.log("✅ Especies y razas cargadas correctamente");
};