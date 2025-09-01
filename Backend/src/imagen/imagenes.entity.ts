import { Property, ManyToOne, Cascade, PrimaryKey, Entity, OneToOne} from '@mikro-orm/core';
import { Publicacion } from '../publicacion/publicacion.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Mascota } from '../mascota/mascota.entity.js';

@Entity()
export class Imagen {
  @PrimaryKey()
  idImagen!: number;

  @Property()
  path!: string;

  @ManyToOne(() => Publicacion, { cascade: [Cascade.PERSIST, Cascade.MERGE] })
  publicacion?: Publicacion;

  @OneToOne(() => Usuario, {cascade: [Cascade.PERSIST, Cascade.MERGE]})
  usuario?: Usuario;

  @OneToOne(() => Mascota, {cascade: [Cascade.PERSIST, Cascade.MERGE]})
  mascota?: Mascota;
}