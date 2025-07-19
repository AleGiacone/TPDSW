import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Reserva } from "../reserva/reserva.entity.js";

@Entity() 
export class Publicacion {
  @PrimaryKey()
  idPublicacion!: number;

  @Property({ nullable: false, unique: false })
  idCuidador!: number;

  @Property({ nullable: false, unique: false })
  titulo!: string;

  @Property({ nullable: false, unique: false })
  descripcion!: string;

  @Property({ nullable: false, unique: false })
  fechaPublicacion!: Date;

  @OneToMany(() => Reserva, reserva => reserva.publicacion, { cascade: [Cascade.ALL] })
  reservas = new Collection<Reserva>(this);
}
