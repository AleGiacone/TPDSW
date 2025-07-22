import { Cascade, Collection, Entity, ManyToMany, PrimaryKey, Property } from "@mikro-orm/core";


@Entity({
  discriminatorColumn: 'tipo',
  discriminatorValue: 'usuario'
})
export class Usuario {
  @PrimaryKey()
  idUsuario!: number;
  // Darle la razon a pilar de que hay que poner un nombre
  @Property({ nullable: false, unique: false })
  nombre!: string;

  @Property({ nullable: false, unique: true })
  email!: string;

  @Property({ nullable: false, unique: false })
  password!: string;

  @Property({ nullable: false, unique: false })
  tipoUsuario!: string;  

}