var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, OneToOne, Property } from "@mikro-orm/core";
import { Usuario } from "../usuario/usuario.entity.js";
import { Publicacion } from "../publicacion/publicacion.entity.js";
export let Cuidador = class Cuidador extends Usuario {
};
__decorate([
    Property({ nullable: true, unique: true }),
    __metadata("design:type", String)
], Cuidador.prototype, "nroDocumento", void 0);
__decorate([
    Property({ nullable: true, unique: false }),
    __metadata("design:type", String)
], Cuidador.prototype, "tipoDocumento", void 0);
__decorate([
    Property({ nullable: true, unique: false }),
    __metadata("design:type", String)
], Cuidador.prototype, "telefono", void 0);
__decorate([
    Property({ nullable: true, unique: false }),
    __metadata("design:type", String)
], Cuidador.prototype, "sexoCuidador", void 0);
__decorate([
    OneToOne(() => Publicacion, { nullable: true }),
    __metadata("design:type", Object)
], Cuidador.prototype, "publicacion", void 0);
Cuidador = __decorate([
    Entity({
        discriminatorValue: 'cuidador'
    })
], Cuidador);
//# sourceMappingURL=cuidador.entity.js.map