import { Collection, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryKey, Property, Cascade, Rel, Type, Platform  } from "@mikro-orm/core";
import { Publicacion } from "../publicacion/publicacion.entity.js";
import { Cuidador } from "../cuidador/cuidador.entity.js";
import { Dueno } from "../dueno/dueno.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";

// Testeo de propiedad Date

import { Temporal } from 'temporal-polyfill';
export class TemporalDateType extends Type<Temporal.PlainDate, string> {
  // Convierte de JS a Database
  convertToDatabaseValue(value: Temporal.PlainDate | string): string {
    if (typeof value === 'string') return value;
    return value.toString(); // Formato: YYYY-MM-DD
  }

  // Convierte de Database a JS
  convertToJSValue(value: string): Temporal.PlainDate {
    return Temporal.PlainDate.from(value);
  }

  // Define el tipo de columna en la DB
  getColumnType(): string  {
    return 'date';
  }
}

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

  //Testeo de propiedad Date

  @Property({ type: TemporalDateType, nullable: true, unique: false})
  fechasReservadas?: Temporal.PlainDate[];

}