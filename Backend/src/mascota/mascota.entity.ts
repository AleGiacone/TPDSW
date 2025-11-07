  import { Cascade, Collection, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryKey, Property, Rel } from "@mikro-orm/core";
  import { Dueno } from "../dueno/dueno.entity.js";
  import { Reserva } from "../reserva/reserva.entity.js";
  import { Especie } from "../especie/especie.entity.js";
  import { Raza } from "../raza/raza.entity.js"
  import { Imagen } from "../imagen/imagenes.entity.js";

  @Entity()
  export class Mascota {

    @PrimaryKey()
    idMascota!: number;
    @Property({ nullable: false, unique: false })
    nomMascota!: string;
    
    @Property({ nullable: false, unique: false })
    edad!: string;

    @Property({ nullable: false, unique: false })
    sexo!: string;
    
    @ManyToOne( () => Especie, { nullable: false })
    especie!: Rel<Especie>;

    @ManyToOne(() => Raza, { nullable: true })
    raza?: Rel<Raza>;
  
    @Property({ type: 'boolean', default: false })
    exotico!: boolean;

    @Property({ nullable: true, unique: false })
    peso!: number;
    
    @Property({ nullable: false, unique: false })
    descripcion?: string;
    
    @ManyToOne({ entity: () => Dueno, nullable: false,  })
    dueno!: Rel<Dueno>;


    @ManyToMany(() => Reserva, reserva => reserva.mascotas)
    reservas = new Collection<Reserva>(this);

    @Property({nullable: true, unique: false})
    fotoPerfil?: string;

    @OneToOne('Imagen', 'mascota', {
      owner: true, 
      cascade: [Cascade.PERSIST, Cascade.MERGE],
      nullable: true 
    })
    imagen?: Rel<any>;

  }