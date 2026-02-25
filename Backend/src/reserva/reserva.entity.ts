import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property, Cascade, Rel, Type, Platform } from "@mikro-orm/core";
import { Publicacion } from "../publicacion/publicacion.entity.js";
import { Dueno } from "../dueno/dueno.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";
import { DiaReservado } from "./diaReservado.entity.js";

// Testeo de propiedad Date

import { Temporal } from 'temporal-polyfill';


@Entity()
export class Reserva {
  @PrimaryKey({ autoincrement: true })
  idReserva!: number;

  @Property({ nullable: false, unique: false })
  fechaReserva!: Date;

  @Property({ nullable: true, unique: false })
  fechaDesde?: Date;

  @Property({ nullable: true, unique: false })
  fechaHasta?: Date;

  @Property({ nullable: false, unique: false })
  descripcion!: string;

  @ManyToOne(() => Publicacion, { nullable: false })
  public publicacion!: Rel<Publicacion>;

  @ManyToOne(() => Dueno, { nullable: false })
  public dueno!: Rel<Dueno>;

  @ManyToMany({ entity: () => Mascota, cascade: [Cascade.ALL] })
  mascotas = new Collection<Mascota>(this);

  @OneToMany(() => DiaReservado, diasReservados => diasReservados.reserva, { nullable: true, cascade: [Cascade.ALL], orphanRemoval: true })
  diasReservados = new Collection<DiaReservado>(this);

}