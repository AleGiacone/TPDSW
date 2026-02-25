import { Cascade, Collection, Entity, OneToMany, ManyToOne,OneToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Reserva } from "../reserva/reserva.entity.js";
import { Cuidador } from "../cuidador/cuidador.entity.js";
import { Imagen } from "../imagen/imagenes.entity.js";
import { DiaReservado } from "../reserva/diaReservado.entity.js";
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
  exotico!: boolean;           
<<<<<<< HEAD

  @ManyToOne(() => Cuidador, { nullable: true })
=======
  
  @ManyToOne(() => Cuidador, { nullable: true})
>>>>>>> main
  idCuidador!: Rel<Cuidador>;

  @OneToMany(() => Reserva, reserva => reserva.publicacion, { nullable: true, cascade: [Cascade.ALL], orphanRemoval: true })
  reservas = new Collection<Reserva>(this);

  @Property({ nullable: false, unique: false })
  tarifaPorDia!: number;

  @OneToMany(() => Imagen, imagen => imagen.publicacion, { nullable: true, cascade: [Cascade.ALL],  orphanRemoval: true })
  imagenes = new Collection<Imagen>(this);
  
  @Property({ nullable: true, unique: false })
  ubicacion?: string;

  @Property({ nullable: true, unique: false })
  tipoAlojamiento?: string; // 'casa', 'domicilio', 'ambos'

  @Property({ nullable: true, unique: false, default: 1 })
  cantAnimales?: number;

  @OneToMany(() => DiaReservado, diasReservados => diasReservados.publicacion, { nullable: true})
  diasOcupados = new Collection<DiaReservado>(this);


}
