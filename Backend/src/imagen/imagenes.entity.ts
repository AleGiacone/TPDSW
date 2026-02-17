import { Property, ManyToOne, Cascade, PrimaryKey, Entity, OneToOne, Rel} from '@mikro-orm/core';
import { Mascota} from '../mascota/mascota.entity.js';
import { Publicacion } from '../publicacion/publicacion.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';

@Entity()
export class Imagen {
  @PrimaryKey()
  idImagen!: number;
  
  @Property()
  path!: string;
  
  @ManyToOne(() => Publicacion,  
{ nullable: true })
  publicacion?: Rel<Publicacion>;

  @OneToOne(() => Usuario, usuario => usuario.imagen, { nullable: true, deleteRule: 'set null' }) 
  usuario?: Rel<Usuario>;

  @OneToOne(() => Mascota, mascota => mascota.imagen, { nullable: true, deleteRule: 'set null' }) 
  mascota?: Rel<Mascota>;



}