import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Reserva } from "../reserva/reserva.entity.js";
@Entity()
export class Pago {
  @PrimaryKey()
  idPago!: number;

  @Property({ nullable: false, unique: false })
  idReserva!: number;

  @Property({ nullable: false, unique: false })
  monto!: number;

  @Property({ nullable: false, unique: false })
  fechaPago!: Date;


}