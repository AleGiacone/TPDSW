var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Cascade, Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import { Usuario } from "../usuario/usuario.entity.js";
import { Mascota } from "../mascota/mascota.entity.js";
import { Reserva } from "../reserva/reserva.entity.js";
export let Dueno = class Dueno extends Usuario {
    constructor() {
        super(...arguments);
        this.mascotas = new Collection(this);
        this.reservas = new Collection(this);
    }
};
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", String)
], Dueno.prototype, "nombre", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", String)
], Dueno.prototype, "nroDocumento", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", String)
], Dueno.prototype, "tipoDocumento", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", String)
], Dueno.prototype, "telefono", void 0);
__decorate([
    Property({ nullable: false, unique: false }),
    __metadata("design:type", String)
], Dueno.prototype, "telefonoEmergencia", void 0);
__decorate([
    OneToMany(() => Mascota, mascota => mascota.dueno, { cascade: [Cascade.ALL] }),
    __metadata("design:type", Object)
], Dueno.prototype, "mascotas", void 0);
__decorate([
    OneToMany(() => Reserva, reserva => reserva.dueno, { cascade: [Cascade.ALL] }),
    __metadata("design:type", Object)
], Dueno.prototype, "reservas", void 0);
Dueno = __decorate([
    Entity()
], Dueno);
//# sourceMappingURL=dueno.entity.js.map