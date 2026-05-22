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
exports.UpdatePurchaseStatusDto = exports.ConfirmPaymentDto = exports.CreatePurchaseDto = exports.PACKAGES = exports.MIN_TICKETS = exports.TICKET_PRICE = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const purchase_entity_1 = require("../entities/purchase.entity");
exports.TICKET_PRICE = 400;
exports.MIN_TICKETS = 25;
exports.PACKAGES = [
    { quantity: 25, total: 25 * exports.TICKET_PRICE, label: 'Paquete Básico' },
    { quantity: 50, total: 50 * exports.TICKET_PRICE, label: 'Paquete Bronce' },
    { quantity: 75, total: 75 * exports.TICKET_PRICE, label: 'Paquete Plata' },
    { quantity: 100, total: 100 * exports.TICKET_PRICE, label: 'Paquete Oro' },
    { quantity: 200, total: 200 * exports.TICKET_PRICE, label: 'Paquete Diamante' },
];
class CreatePurchaseDto {
}
exports.CreatePurchaseDto = CreatePurchaseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Juan Pérez' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre es requerido' }),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "buyerName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+573001234567' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'El teléfono es requerido' }),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "buyerPhone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'juan@email.com' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email inválido' }),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "buyerEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Bogotá' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'La ciudad es requerida' }),
    __metadata("design:type", String)
], CreatePurchaseDto.prototype, "buyerCity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: 'La cantidad debe ser un número entero' }),
    (0, class_validator_1.Min)(exports.MIN_TICKETS, { message: `La compra mínima es de ${exports.MIN_TICKETS} números ($${exports.MIN_TICKETS * exports.TICKET_PRICE} COP)` }),
    __metadata("design:type", Number)
], CreatePurchaseDto.prototype, "quantity", void 0);
class ConfirmPaymentDto {
}
exports.ConfirmPaymentDto = ConfirmPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'wompi' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "paymentProvider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'pay_abc123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ConfirmPaymentDto.prototype, "paymentDetails", void 0);
class UpdatePurchaseStatusDto {
}
exports.UpdatePurchaseStatusDto = UpdatePurchaseStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: purchase_entity_1.PaymentStatus }),
    (0, class_validator_1.IsEnum)(purchase_entity_1.PaymentStatus),
    __metadata("design:type", String)
], UpdatePurchaseStatusDto.prototype, "status", void 0);
//# sourceMappingURL=purchases.dto.js.map