import { Cascade, Collection, Entity, OneToMany, OneToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Usuario } from "../usuario/usuario.entity.js";
import { Reserva } from "../reserva/reserva.entity.js";
import { Publicacion } from "../publicacion/publicacion.entity.js";

@Entity({
  discriminatorValue: 'cuidador'
})
export class Cuidador extends Usuario {

  @Property({ nullable: true, unique: true })
  nroDocumento!: string;

  @Property({ nullable: true, unique: false })
  tipoDocumento!: string;

  @Property({ nullable: true, unique: false })
  telefono!: string;

  @Property({ nullable: true, unique: false })
  sexoCuidador!: string;

  @OneToOne(() => Publicacion, { nullable: true })
  publicacion?: Rel<Publicacion>;

}