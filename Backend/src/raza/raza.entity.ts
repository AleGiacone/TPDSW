import { Cascade, Collection, Entity, ManyToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Especie } from "../especie/especie.entity.js";

@Entity()
export class Raza {
  @PrimaryKey({ autoincrement: true })
  idRaza!: number;

  @Property({ nullable: false, unique: true })
  nomRaza!: string;

  @ManyToMany({ entity: () => Especie, cascade: [Cascade.ALL] })
  especies = new Collection<Especie>(this);
}