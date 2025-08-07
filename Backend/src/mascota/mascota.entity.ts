import { Cascade, Collection, Entity, ManyToMany, ManyToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Dueno } from "../dueno/dueno.entity.js";
import { Reserva } from "../reserva/reserva.entity.js";
import { Especie } from "../especie/especie.entity.js";

@Entity()
export class Mascota {

  @PrimaryKey()
  idMascota!: number;
  // Comprobar que el nombre de las mascotas por cada dueño sea único
  @Property({ nullable: false, unique: false })
  nomMascota!: string;
  
  @Property({ nullable: false, unique: false })
  edad!: string;

  @Property({ nullable: false, unique: false })
  sexo!: string;
  
  @ManyToOne( () => Especie, { nullable: false, cascade: [Cascade.ALL] })
  especie!: Rel<Especie>;
  
  @Property()
  exotico!:({ type: boolean, default: false });

  @Property({ nullable: true, unique: false })
  peso!: number;
  
  @Property({ nullable: false, unique: false })
  descripcion?: string;
  
  @ManyToOne({ entity: () => Dueno, nullable: false, cascade: [Cascade.ALL] })
  dueno!: Rel<Dueno>;

  @ManyToMany(() => Reserva, reserva => reserva.mascotas, { cascade: [Cascade.ALL] })
  reservas = new Collection<Reserva>(this);


}