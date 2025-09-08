import { Cascade, Collection, Entity, ManyToMany, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Raza } from "../raza/raza.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";

@Entity()
export class Especie {
  @PrimaryKey()
  idEspecie?: number

  @Property({nullable:false, unique:true})
  nomEspecie!: string
  
  @OneToMany(() => Raza, raza => raza.especie, {cascade: [Cascade.ALL]})
  razas = new Collection<Raza>(this); 

  @OneToMany(() => Mascota, mascota => mascota.especie, { cascade: [Cascade.ALL] })
  mascotas = new Collection<Mascota>(this);

}