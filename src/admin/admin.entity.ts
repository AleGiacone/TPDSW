import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Usuario } from "../usuario/usuario.entity.js";

@Entity()
export class Admin extends Usuario {


} 