import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property, Cascade, Rel } from "@mikro-orm/core";
import { Publicacion } from "../publicacion/publicacion.entity.js";
import { Cuidador } from "../cuidador/cuidador.entity.js";
import { Dueno } from "../dueno/dueno.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";

@Entity()
export class Reserva {
  @PrimaryKey()
  idReserva!: number;

  @Property({ nullable: false, unique: false })
  fechaReserva!: Date;

  @Property({ nullable: false, unique: false })
  fechaDesde!: Date;

  @Property({ nullable: false, unique: false })
  fechaHasta!: Date;

  @Property({ nullable: false, unique: false })
  descripcion!: string;

  @ManyToOne(() => Publicacion, { nullable: false })
  public publicacion!: Rel<Publicacion>;

  @ManyToOne(() => Dueno, { nullable: false})
  public dueno!: Rel<Dueno>;

  @ManyToMany({entity: () => Mascota, cascade: [Cascade.ALL]})
  mascotas = new Collection<Mascota>(this);
  // Falta agregar pago

}