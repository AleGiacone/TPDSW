import { Cascade, Collection, Entity, OneToMany, OneToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
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

  @Property({ nullable: true, unique: false })
  ubicacion!: string;

  @Property({ nullable: true, unique: false })
  tipoAlojamiento!: string;

  @Property({ nullable: true, unique: false })
  exotico!: boolean;

  @Property({ nullable: true, unique: false })
  cantAnimales!: number;                 
  
  @OneToOne(() => Cuidador, cuidador => cuidador.publicacion, { nullable: true,  }) 
  idCuidador!: Rel<Cuidador>;

  @OneToMany(() => Reserva, reserva => reserva.publicacion, { nullable: true})
  reservas = new Collection<Reserva>(this);

  @Property({ nullable: false, unique: false })
  tarifaPorDia!: number;

  @OneToMany(() => Imagen, imagen => imagen.publicacion, { nullable: true, cascade: [Cascade.ALL] })
  imagenes = new Collection<Imagen>(this);
}
