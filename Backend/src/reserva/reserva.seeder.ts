import { Dueno } from "../dueno/dueno.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";
import { Reserva } from "./reserva.entity.js";
import { EntityManager } from "@mikro-orm/core";
import { Publicacion } from "../publicacion/publicacion.entity.js";

const reservasData = [
  {
    idReserva: 2,
    fechaReserva: new Date('2026-03-01'),
    fechaDesde: new Date('2026-03-10'),
    fechaHasta: new Date('2026-03-15'),
    descripcion: 'Reserva para cuidar a mi perro durante mis vacaciones.',
    idPublicacion: 1,
    idDueno: 3,
    mascota: 2
  }]

export const seedReservas = async (em: EntityManager): Promise<void> => {
  try {
    for (const data of reservasData) {
      // Si ya existe la reserva, la saltea para evitar duplicados
      const existe = await em.findOne(Reserva, { descripcion: data.descripcion });
      const dueno = await em.findOne(Dueno, { idUsuario: data.idDueno });
      const mascota = await em.findOne(Mascota, { idMascota: data.mascota });
      const publicacion = await em.findOne(Publicacion, { idPublicacion: data.idPublicacion });
      if(existe) {
        console.log('La reserva ya existe, saltando:', data.descripcion);
      }
      if (!dueno) {
        console.log('Dueño encontrado para id:', );
        return; 
      }
      if (!mascota) {
        console.log('Mascota encontrada para id:', );
        return;
      }
      if (!publicacion) {
        console.log('Publicación encontrada para id:', );
        return;
      }

      console.log('Creando reserva con datos:', data);
      const nuevaReserva = em.create(Reserva, { ...data, dueno: dueno, publicacion: publicacion })
      console.log('Reserva creada:', nuevaReserva);
      nuevaReserva.mascotas.add(mascota);
      await em.persistAndFlush(nuevaReserva);
    }
  } catch (error) {
     console.error("Error al cargar las reservas:", error);
  }   
}