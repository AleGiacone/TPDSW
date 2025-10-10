import { Cascade, Collection, Entity, OneToMany, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Reserva } from "../reserva/reserva.entity.js";
import { Cuidador } from "../cuidador/cuidador.entity.js";
import { Imagen } from "../imagen/imagenes.entity.js";
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

  @ManyToOne(() => Cuidador, { nullable: false })
  idCuidador!: Rel<Cuidador>;

  @OneToMany(() => Reserva, reserva => reserva.publicacion, { nullable: true, cascade: [Cascade.ALL] })
  reservas = new Collection<Reserva>(this);

  @Property({ nullable: false, unique: false })
  precio!: number;

  @OneToMany(() => Imagen, imagen => imagen.publicacion, { nullable: true, cascade: [Cascade.ALL] })
  imagenes = new Collection<Imagen>(this);
  
  @Property({ nullable: true, unique: false })
  ubicacion?: string;

  @Property({ nullable: true, unique: false })
  tipoAlojamiento?: string; // 'casa', 'domicilio', 'ambos'

  @Property({ nullable: true, unique: false, default: 1 })
  cantAnimales?: number;

  @Property({ nullable: true, unique: false, default: false })
  exotico?: boolean;
}
