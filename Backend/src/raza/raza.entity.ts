import { Cascade, Collection, Entity, ManyToOne, PrimaryKey, Property, Rel, OneToMany } from "@mikro-orm/core";
import { Especie } from "../especie/especie.entity.js";
import { Mascota } from '../mascota/mascota.entity.js'

@Entity()
export class Raza {
  @PrimaryKey({ autoincrement: true })
  idRaza!: number;

  @Property({ nullable: false, unique: false })
  nomRaza!: string;

  @ManyToOne(() => Especie, { nullable: false, cascade: [Cascade.PERSIST] })
  especie!: Rel<Especie>;

  @OneToMany(() => Mascota, mascota => mascota.raza, { cascade: [Cascade.ALL] })
  mascotas = new Collection<Mascota>(this);
}