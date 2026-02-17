import { Publicacion } from "./publicacion.entity.js";
import { EntityManager } from "@mikro-orm/core";
import { Cuidador } from "../cuidador/cuidador.entity.js";

const publicacionesData = [
  {
    idPublicacion: 1,
    titulo: "Amor para tu mascota",
    descripcion: "Cuidamos a tu mascota como si fuera nuestra",
    fechaPublicacion: '2026-01-01',
    exotico: false,
    tarifaPorDia: 500,
    ubicacion: "Patio de Hogwarts",
    tipoAlojamiento: "casa",
    idCuidador: 6,
    cantAnimales: 2
  },
  {
    idPublicacion: 2,
    titulo: "Cuidado de mascotas exóticas",
    descripcion: "Especializados en el cuidado de mascotas exóticas",
    fechaPublicacion: '2026-02-01',
    exotico: true,
    tarifaPorDia: 1000,
    ubicacion: "Cueva de Hipo",
    tipoAlojamiento: "domicilio",
    idCuidador: 7,
    cantAnimales: 1
  }
]

export const seedPublicaciones = async (em: EntityManager): Promise<void> => {
  try {
    for (const data of publicacionesData) {
      // Si ya existe la publicación, la saltea para evitar duplicados
      const existe = await em.findOne(Publicacion, { titulo: data.titulo });
      const cuidador = await em.findOne(Cuidador, { idUsuario: data.idCuidador });
      if (existe || !cuidador) continue;
      const nuevaPublicacion = em.create(Publicacion, { ...data, idCuidador: cuidador });
      nuevaPublicacion.idCuidador = cuidador;
      await em.persistAndFlush(nuevaPublicacion);

    }
  } catch (error) {
    console.error("Error al cargar las publicaciones:", error);
  }
};