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
exports.Raffle = exports.RaffleStatus = void 0;
const typeorm_1 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const ticket_entity_1 = require("./ticket.entity");
const purchase_entity_1 = require("./purchase.entity");
var RaffleStatus;
(function (RaffleStatus) {
    RaffleStatus["OPEN"] = "OPEN";
    RaffleStatus["CLOSED"] = "CLOSED";
    RaffleStatus["DRAWN"] = "DRAWN";
})(RaffleStatus || (exports.RaffleStatus = RaffleStatus = {}));
let Raffle = class Raffle {
};
exports.Raffle = Raffle;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Raffle.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Raffle.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Raffle.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Raffle.prototype, "prize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Raffle.prototype, "prizeImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 400 }),
    __metadata("design:type", Number)
], Raffle.prototype, "pricePerNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], Raffle.prototype, "packages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ default: 10 }),
    __metadata("design:type", Number)
], Raffle.prototype, "blessedCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 50000 }),
    __metadata("design:type", Number)
], Raffle.prototype, "blessedPrize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Raffle.prototype, "drawDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, typeorm_1.Column)({ default: 10000 }),
    __metadata("design:type", Number)
], Raffle.prototype, "totalNumbers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: RaffleStatus }),
    (0, typeorm_1.Column)({ type: 'enum', enum: RaffleStatus, default: RaffleStatus.OPEN }),
    __metadata("design:type", String)
], Raffle.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Raffle.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Raffle.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ticket_entity_1.Ticket, (ticket) => ticket.raffle),
    __metadata("design:type", Array)
], Raffle.prototype, "tickets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => purchase_entity_1.Purchase, (purchase) => purchase.raffle),
    __metadata("design:type", Array)
], Raffle.prototype, "purchases", void 0);
exports.Raffle = Raffle = __decorate([
    (0, typeorm_1.Entity)('raffles')
], Raffle);
//# sourceMappingURL=raffle.entity.js.map