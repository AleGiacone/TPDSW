var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Cascade, Collection, Entity, ManyToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Especie } from "../especie/especie.entity.js";
export let Raza = class Raza {
    constructor() {
        this.especies = new Collection(this);
    }
};
__decorate([
    PrimaryKey(),
    __metadata("design:type", Number)
], Raza.prototype, "idRaza", void 0);
__decorate([
    Property({ nullable: false, unique: true }),
    __metadata("design:type", String)
], Raza.prototype, "nomRaza", void 0);
__decorate([
    ManyToMany({ entity: () => Especie, cascade: [Cascade.ALL] }),
    __metadata("design:type", Object)
], Raza.prototype, "especies", void 0);
Raza = __decorate([
    Entity()
], Raza);
//# sourceMappingURL=raza.entity.js.map