import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Usuario } from "../usuario/usuario.entity.js";
import { Reserva } from "../reserva/reserva.entity.js";

@Entity()
export class Cuidador extends Usuario {
  @Property({ nullable: false, unique: false })
  nombreCuidador!: string;

  @Property({ nullable: false, unique: false })
  nroDocumento!: string;

  @Property({ nullable: false, unique: false })
  tipoDocumento!: string;

  @Property({ nullable: false, unique: false })
  telefono!: string;

  @Property({ nullable: false, unique: false })
  sexoCuidador!: string;

  @OneToMany(() => Reserva, reserva => reserva.cuidador, { cascade: [Cascade.ALL] })
  reservas = new Collection<Reserva>(this);

}