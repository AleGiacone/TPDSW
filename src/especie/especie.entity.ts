import { Cascade, Collection, Entity, ManyToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Raza } from "./raza.entity.js";

@Entity()
export class Especie {
  @PrimaryKey()
  idEspecie!: number

  @Property({nullable:false, unique:true})
  nomEspecie!: string
  
  @ManyToMany(() => Raza, raza => raza.especies, {cascade:[Cascade.ALL]})
  razas = new Collection<Raza>(this); 

}