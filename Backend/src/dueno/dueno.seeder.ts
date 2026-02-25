import { Dueno } from './dueno.entity.js';
import { EntityManager } from '@mikro-orm/core';
import bcrypt from 'bcrypt';

const duenosData = [
  {
    nombre: 'Harry Potter',
    email: 'harry.potter@hogwarts.edu',
    password: await bcrypt.hash('magic123', 10),
    nroDocumento: '123456781',
    tipoDocumento: 'DNI',
    telefono: '555-1234',
    sexoDueno: 'Masculino',
    descripcion: 'Amante de los animales y con experiencia en cuidado de mascotas.',
    idUsuario: 3,
    tipoUsuario: 'dueno'
  },
  
  {
    nombre: 'Katniss Everdeen',
    email: 'katniss.everdeen@district13.gov',
    password: await bcrypt.hash('arrow123', 10),
    nroDocumento: '87654321',
    tipoDocumento: 'DNI',
    telefono: '555-5678',
    sexoDueno: 'Femenino',
    descripcion: 'Odio a mi gato pero la cuido porque es mi mascota.',
    idUsuario: 4,
    tipoUsuario: 'dueno'
  }
]

export const seedDuenos = async (em: EntityManager): Promise<void> => {
  
  try {
  for (const data of duenosData) {
    // Si ya existe el dueño, lo saltea para evitar duplicados
    const existes = await em.findOne(Dueno, { email: data.email });
    if (existes) continue;
    const existe = await em.findOne(Dueno, { nroDocumento: data.nroDocumento });
    if (existe) continue;
    const nuevoDueno = em.create(Dueno, data);
  }
  await em.flush();
  } catch (error) {
    console.error("Error al cargar los dueños:", error);
  }
  console.log("✅ Dueños cargados correctamente");
}