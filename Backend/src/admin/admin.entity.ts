import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Usuario } from "../usuario/usuario.entity.js";

@Entity({
  discriminatorValue: 'admin'
})
export class Admin extends Usuario {


} 
