import { Entity, ManyToOne, PrimaryKey, Property, Rel, Type} from "@mikro-orm/core";
import { Reserva } from "../reserva/reserva.entity.js";
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

  // Define el tipo de columna en la DBd
  getColumnType(): string  {
    return 'date';
  }
}


@Entity()
export class DiaReservado {

  //Resvisar el obligatorio de el idDiaReservado

  @PrimaryKey()
  idDiaReservado?: number;

  @ManyToOne(() => Reserva, { nullable: true})
  reserva!: Rel<Reserva>;

  @Property({ nullable: true, unique: false})
  fechaReservada!: String;



}