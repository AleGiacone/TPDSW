var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Reserva } from "../reserva/reserva.entity.js";
export let Publicacion = class Publicacion {
    constructor() {
        this.reservas = new Collection(this);
    }
};
__decorate([
    PrimaryKey(),
    __metadata("design:type", Number)
], Publicacion.prototype, "idPublicacion", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", Number)
], Publicacion.prototype, "idCuidador", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", String)
], Publicacion.prototype, "titulo", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", String)
], Publicacion.prototype, "descripcion", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", Date)
], Publicacion.prototype, "fechaPublicacion", void 0);
__decorate([
    OneToMany(() => Reserva, reserva => reserva.publicacion, { cascade: [Cascade.ALL] }),
    __metadata("design:type", Object)
], Publicacion.prototype, "reservas", void 0);
Publicacion = __decorate([
    Entity()
], Publicacion);
//# sourceMappingURL=publicacion.entity.js.map