import { Property, ManyToOne, Cascade, PrimaryKey, Entity, OneToOne } from '@mikro-orm/core';

@Entity()
export class Imagen {
  @PrimaryKey()
  idImagen!: number;
  
  @Property()
  path!: string;
  
  // Usando string references para evitar imports circulares
  @ManyToOne('Publicacion', { 
    cascade: [Cascade.PERSIST, Cascade.MERGE],
    nullable: true 
  })
  publicacion?: any;

  @OneToOne('Usuario', 'imagen', {
    cascade: [Cascade.PERSIST, Cascade.MERGE],
    nullable: true,
    owner: true
  })
  usuario?: any;

  @OneToOne('Mascota', {
    cascade: [Cascade.PERSIST, Cascade.MERGE],
    nullable: true
  })
  mascota?: any;
}