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
exports.UpdateRaffleStatusDto = exports.UpdateRaffleDto = exports.CreateRaffleDto = exports.PackageDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const raffle_entity_1 = require("../entities/raffle.entity");
class PackageDto {
}
exports.PackageDto = PackageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25 }),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? parseInt(value, 10) : value),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], PackageDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Paquete Básico' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PackageDto.prototype, "label", void 0);
class CreateRaffleDto {
}
exports.CreateRaffleDto = CreateRaffleDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRaffleDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateRaffleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateRaffleDto.prototype, "prize", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 400 }),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? parseFloat(value) : value),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateRaffleDto.prototype, "pricePerNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fecha del sorteo (opcional)' }),
    (0, class_transformer_1.Transform)(({ value }) => value ? value : undefined),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateRaffleDto.prototype, "drawDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [PackageDto] }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return parsed;
            }
            catch {
                return undefined;
            }
        }
        return value;
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PackageDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateRaffleDto.prototype, "packages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateRaffleDto.prototype, "blessedCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 50000 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateRaffleDto.prototype, "blessedPrize", void 0);
class UpdateRaffleDto {
}
exports.UpdateRaffleDto = UpdateRaffleDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateRaffleDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateRaffleDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? value.trim() : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateRaffleDto.prototype, "prize", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => typeof value === 'string' ? parseFloat(value) : value),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateRaffleDto.prototype, "pricePerNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value ? value : undefined),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateRaffleDto.prototype, "drawDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [PackageDto] }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return parsed;
            }
            catch {
                return undefined;
            }
        }
        return value;
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PackageDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateRaffleDto.prototype, "packages", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateRaffleDto.prototype, "blessedCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateRaffleDto.prototype, "blessedPrize", void 0);
class UpdateRaffleStatusDto {
}
exports.UpdateRaffleStatusDto = UpdateRaffleStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: raffle_entity_1.RaffleStatus }),
    (0, class_validator_1.IsEnum)(raffle_entity_1.RaffleStatus),
    __metadata("design:type", String)
], UpdateRaffleStatusDto.prototype, "status", void 0);
//# sourceMappingURL=raffles.dto.js.map