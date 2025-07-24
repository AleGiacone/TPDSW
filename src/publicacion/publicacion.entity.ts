import { Cascade, Collection, Entity, OneToMany, OneToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Reserva } from "../reserva/reserva.entity.js";
import { Cuidador } from "../cuidador/cuidador.entity.js";

@Entity() 
export class Publicacion {
  @PrimaryKey()
  idPublicacion!: number;


  @OneToOne(() => Cuidador, { nullable: false, cascade: [Cascade.ALL] })
  idCuidador!: number;
  @Property({ nullable: false, unique: false })
  titulo!: string;

  @Property({ nullable: false, unique: false })
  descripcion!: string;

  @Property({ nullable: false, unique: false })
  fechaPublicacion!: Date;

  @OneToMany(() => Reserva, reserva => reserva.publicacion, { cascade: [Cascade.ALL] })
  reservas = new Collection<Reserva>(this);

  @Property({ nullable: false, unique: false })
  precio!: number;
  
  @Property({ nullable: true, unique: false })
  imagenes?: string[];
}
