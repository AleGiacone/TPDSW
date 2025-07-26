var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Collection, Entity, ManyToMany, ManyToOne, PrimaryKey, Property, Cascade } from "@mikro-orm/core";
import { Publicacion } from "../publicacion/publicacion.entity.js";
import { Dueno } from "../dueno/dueno.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";
export let Reserva = class Reserva {
    constructor() {
        this.mascotas = new Collection(this);
        // Falta agregar pago
    }
};
__decorate([
    PrimaryKey(),
    __metadata("design:type", Number)
], Reserva.prototype, "idReserva", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", Date)
], Reserva.prototype, "fechaReserva", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", Date)
], Reserva.prototype, "fechaDesde", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", Date)
], Reserva.prototype, "fechaHasta", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", String)
], Reserva.prototype, "descripcion", void 0);
__decorate([
    ManyToOne(() => Publicacion, { nullable: false, cascade: [Cascade.ALL] }),
    __metadata("design:type", Object)
], Reserva.prototype, "publicacion", void 0);
__decorate([
    ManyToOne(() => Dueno, { nullable: false, cascade: [Cascade.ALL] }),
    __metadata("design:type", Object)
], Reserva.prototype, "dueno", void 0);
__decorate([
    ManyToMany({ entity: () => Mascota, cascade: [Cascade.ALL] }),
    __metadata("design:type", Object)
], Reserva.prototype, "mascotas", void 0);
Reserva = __decorate([
    Entity()
], Reserva);
//# sourceMappingURL=reserva.entity.js.map