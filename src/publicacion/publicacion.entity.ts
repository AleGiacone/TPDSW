import { Cascade, Collection, Entity, OneToMany, OneToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Reserva } from "../reserva/reserva.entity.js";
import { Cuidador } from "../cuidador/cuidador.entity.js";

@Entity() 
export class Publicacion {

  @PrimaryKey()
  idPublicacion!: number;
  
  @Property({ nullable: false, unique: false })
  titulo!: string;
  
  @Property({ nullable: false, unique: false })
  descripcion!: string;
  
  @Property({ nullable: true, unique: false })
  fechaPublicacion!: Date;

  @OneToOne(() => Cuidador, cuidador => cuidador.publicacion, { nullable: true, cascade: [Cascade.ALL] })
  idCuidador!: number;

  @OneToMany(() => Reserva, reserva => reserva.publicacion, { nullable: true, cascade: [Cascade.ALL] })
  reservas = new Collection<Reserva>(this);

  @Property({ nullable: false, unique: false })
  precio!: number;
  
  @Property({ nullable: true, unique: false })
  imagenes?: string[];
}
