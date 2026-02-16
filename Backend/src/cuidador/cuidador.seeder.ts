import { Cuidador } from './cuidador.entity.js';
import { EntityManager } from '@mikro-orm/core';
import bcrypt from 'bcrypt';

const cuidadoresData = [
  {
    nombre: 'Hagrid',
    email: 'hagrid@Hogwarts.edu',
    password: await bcrypt.hash('magic123', 10),
    nroDocumento: '102023012',
    tipoDocumento: 'DNI',
    telefono: '555-1234',
    sexoCuidador: 'Masculino',
    descripcion: 'Amante de las criaturas mágicas y con experiencia en cuidado de animales exóticos.',
    idUsuario: 6,
    tipoUsuario: 'cuidador'
},
  {
    nombre: 'Hipo',
    email: 'Hipo@drake.ir',
    password: await bcrypt.hash('hipo123', 10),
    nroDocumento: '120310231',
    tipoDocumento: 'DNI',
    telefono: '555-5678',
    sexoCuidador: 'Masculino',
    descripcion: 'Cuidador experimentado con habilidades en el manejo de animales terrestres.',
    idUsuario: 7,
    tipoUsuario: 'cuidador'
  }

]

export const seedCuidadores = async (em: EntityManager): Promise<void> => {
  try {
  for (const data of cuidadoresData) {
    // Si ya existe el cuidador, lo saltea para evitar duplicados
    const existe = await em.findOne(Cuidador, { email: data.email });
    if (existe) continue;

    const nuevoCuidador = em.create(Cuidador, data);
    
  }
  } catch (error) {
    console.error("Error al cargar los cuidadores:", error);
  }
  await em.flush();
  console.log("✅ Cuidadores cargados correctamente");
}
