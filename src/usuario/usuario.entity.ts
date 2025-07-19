import { Cascade, Collection, Entity, ManyToMany, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Usuario {  
  @PrimaryKey()
  idDueno!: number;

  @Property({ nullable: false, unique: true })
  email!: string;

  @Property({ nullable: false, unique: false })
  password!: string;

}