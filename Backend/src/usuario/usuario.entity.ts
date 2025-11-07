import { Cascade, Collection, Entity, OneToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Imagen } from "../imagen/imagenes.entity.js";

@Entity({
  discriminatorColumn: 'tipo',
  discriminatorValue: 'usuario'
})
export abstract class Usuario {
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

  @OneToOne('Imagen', 'usuario', {
    owner: true, 
    cascade: [Cascade.PERSIST, Cascade.MERGE],
    nullable: true 
  })
  imagen?: Rel<any>;
}
