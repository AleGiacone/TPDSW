import { EntityManager } from "@mikro-orm/core";
import { Admin } from "./admin.entity.js";
import bcrypt from 'bcrypt';



const adminData = [
  { 
    idUsuario: 999,
    nombre: "Admin1",
    email: "admin@admin.com",
    password: await bcrypt.hash("admin123", 10),
    tipoUsuario: "admin"
  }
]

export async function seedAdmins(em: EntityManager) {
  for (const data of adminData) {
    const existingAdmin = await em.findOne(Admin, { email: data.email });
    if (!existingAdmin) {
      const admin = em.create(Admin, data);
      await em.persistAndFlush(admin);
    }
  }
}