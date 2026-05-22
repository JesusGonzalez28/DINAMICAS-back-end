"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const typeorm_1 = require("typeorm");
const raffle_entity_1 = require("./raffle.entity");
const purchase_entity_1 = require("./purchase.entity");
let Ticket = class Ticket {
};
exports.Ticket = Ticket;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Ticket.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 4 }),
    __metadata("design:type", String)
], Ticket.prototype, "number", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Ticket.prototype, "raffleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], Ticket.prototype, "purchaseId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Ticket.prototype, "isBlessed", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Ticket.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => raffle_entity_1.Raffle, (raffle) => raffle.tickets, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'raffleId' }),
    __metadata("design:type", raffle_entity_1.Raffle)
], Ticket.prototype, "raffle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => purchase_entity_1.Purchase, (purchase) => purchase.tickets, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'purchaseId' }),
    __metadata("design:type", Object)
], Ticket.prototype, "purchase", void 0);
exports.Ticket = Ticket = __decorate([
    (0, typeorm_1.Entity)('tickets'),
    (0, typeorm_1.Index)(['raffleId', 'number'], { unique: true })
], Ticket);
//# sourceMappingURL=ticket.entity.js.map