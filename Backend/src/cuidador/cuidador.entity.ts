import { Cascade, Collection, Entity, OneToMany, OneToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
import { Usuario } from "../usuario/usuario.entity.js";
import { Reserva } from "../reserva/reserva.entity.js";
import { Publicacion } from "../publicacion/publicacion.entity.js";

@Entity({
  discriminatorValue: 'cuidador'
})
export class Cuidador extends Usuario {
  // @PrimaryKey()
  // idUsuario!: number;
    
  // @Property({ nullable: false, unique: false })
  // nombre!: string;
  
  // @Property({ nullable: false, unique: true })
  // email!: string;
  
  // @Property({ nullable: false, unique: false })
  // password!: string;
  
  // @Property({ nullable: false, unique: false })
  // tipoUsuario!: string;  
    
  @Property({ nullable: true, unique: true })
  nroDocumento!: string;

  @Property({ nullable: true, unique: false })
  tipoDocumento!: string; 
  
  @Property({ nullable: true, unique: false })
  telefono!: string;

  @Property({ nullable: true, unique: false })
  sexoCuidador!: string;

  @Property({ nullable: true, unique: false })
  descripcion!: string;

  @OneToMany(() => Publicacion, publicacion => publicacion.idCuidador, { 
    nullable: true,
    cascade: [Cascade.REMOVE], orphanRemoval: true 
  })
  publicaciones = new Collection<Publicacion>(this);
}