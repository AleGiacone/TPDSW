import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Usuario } from "../usuario/usuario.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";
import { Reserva } from "../reserva/reserva.entity.js";

@Entity()
export  class Dueno extends Usuario { 

  @Property({ nullable: false, unique: false })
  nombre!: string;

  @Property({ nullable: false, unique: false })
  nroDocumento!: string; 

  @Property({ nullable: false, unique: false })
  tipoDocumento!: string;

  @Property({ nullable: false, unique: false })
  telefono!: string;

  @Property({ nullable: false, unique: false }) 
  telefonoEmergencia?: string;
  
  @OneToMany(() => Mascota, mascota => mascota.dueno, { cascade: [Cascade.ALL] })
  mascotas = new Collection<Mascota>(this);
  
  @OneToMany(() => Reserva, reserva => reserva.dueno, { cascade: [Cascade.ALL] })
  reservas = new Collection<Reserva>(this);

 }