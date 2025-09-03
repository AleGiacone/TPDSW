import { Cascade, Collection, Entity, OneToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Imagen } from "../imagen/imagenes.entity.js";

@Entity({
  abstract: true,
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

  // Corregido: relación bidireccional con Imagen
  @OneToOne(() => Imagen, imagen => imagen.usuario, { 
    cascade: [Cascade.PERSIST, Cascade.MERGE],
    nullable: true 
  })
  imagen?: Rel<Imagen>;
}
