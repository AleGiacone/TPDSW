var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Cascade, Collection, Entity, ManyToMany, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Dueno } from "../dueno/dueno.entity.js";
import { Reserva } from "../reserva/reserva.entity.js";
import { Especie } from "../especie/especie.entity.js";
export let Mascota = class Mascota {
    constructor() {
        this.reservas = new Collection(this);
    }
};
__decorate([
    PrimaryKey(),
    __metadata("design:type", Number)
], Mascota.prototype, "idMascota", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", String)
], Mascota.prototype, "nomMascota", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", String)
], Mascota.prototype, "edad", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", String)
], Mascota.prototype, "sexo", void 0);
__decorate([
    ManyToOne(() => Especie, { nullable: false, cascade: [Cascade.ALL] }),
    __metadata("design:type", Object)
], Mascota.prototype, "especie", void 0);
__decorate([
    Property(),
    __metadata("design:type", Object)
], Mascota.prototype, "exotico", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", String)
], Mascota.prototype, "descripcion", void 0);
__decorate([
    ManyToOne({ entity: () => Dueno, nullable: false, cascade: [Cascade.ALL] }),
    __metadata("design:type", Object)
], Mascota.prototype, "dueno", void 0);
__decorate([
    ManyToMany(() => Reserva, reserva => reserva.mascotas, { cascade: [Cascade.ALL] }),
    __metadata("design:type", Object)
], Mascota.prototype, "reservas", void 0);
Mascota = __decorate([
    Entity()
], Mascota);
//# sourceMappingURL=mascota.entity.js.map