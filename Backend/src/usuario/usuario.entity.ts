import { Cascade, Collection, Entity, ManyToMany, OneToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Imagen } from "../imagen/imagenes.entity.js";


@Entity({
  discriminatorColumn: 'tipo',
  discriminatorValue: 'usuario'
})
export class Usuario {
  @PrimaryKey()
  idUsuario!: number;
  
  @Property({ nullable: false, unique: false })
  nombre!: string;

  @Property({ nullable: false, unique: true })
  email!: string;

  @Property({ nullable: false, unique: false })
  password!: string;

  @Property({ nullable: false, unique: false })
  tipoUsuario!: string;  

  @Property({ nullable: true, unique: false })
  perfilImage?: string;

  @OneToOne(() => Imagen, { cascade: [Cascade.PERSIST, Cascade.MERGE] })
  imagen?: Imagen;

}