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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const passport_1 = require("@nestjs/passport");
const purchases_service_1 = require("./purchases.service");
const purchases_dto_1 = require("./purchases.dto");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_entity_1 = require("../entities/user.entity");
const voucherStorage = (0, multer_1.diskStorage)({
    destination: './uploads/vouchers',
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `voucher-${unique}${(0, path_1.extname)(file.originalname)}`);
    },
});
let PurchasesController = class PurchasesController {
    constructor(purchasesService) {
        this.purchasesService = purchasesService;
    }
    getPackages() {
        return this.purchasesService.getPackages();
    }
    create(raffleId, dto) {
        return this.purchasesService.create(raffleId, dto);
    }
    uploadVoucher(purchaseId, file) {
        if (!file)
            throw new common_1.BadRequestException('Debes subir una imagen del comprobante');
        return this.purchasesService.uploadVoucher(purchaseId, file.path);
    }
    searchPurchases(query) {
        if (!query) {
            throw new common_1.BadRequestException('Debes enviar un teléfono o correo para buscar compras');
        }
        return this.purchasesService.searchPurchases(query);
    }
    findByRaffle(raffleId) {
        return this.purchasesService.findByRaffle(raffleId);
    }
    topBuyers(raffleId) {
        return this.purchasesService.getTopBuyers(raffleId);
    }
    findOne(purchaseId) {
        return this.purchasesService.findOne(purchaseId);
    }
    approve(purchaseId) {
        return this.purchasesService.approvePurchase(purchaseId);
    }
    reject(purchaseId) {
        return this.purchasesService.rejectPurchase(purchaseId);
    }
    cancel(purchaseId) {
        return this.purchasesService.cancelPurchase(purchaseId);
    }
};
exports.PurchasesController = PurchasesController;
__decorate([
    (0, common_1.Get)('packages'),
    (0, swagger_1.ApiOperation)({ summary: 'Ver paquetes y datos de pago Nequi' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "getPackages", null);
__decorate([
    (0, common_1.Post)('raffles/:raffleId/purchases'),
    (0, swagger_1.ApiOperation)({ summary: 'Reservar números (sin pago aún)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Números reservados, procede a pagar' }),
    __param(0, (0, common_1.Param)('raffleId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, purchases_dto_1.CreatePurchaseDto]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('purchases/:purchaseId/voucher'),
    (0, swagger_1.ApiOperation)({ summary: 'Cliente sube comprobante de pago' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('voucher', {
        storage: voucherStorage,
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.webp'];
            if (!allowed.includes((0, path_1.extname)(file.originalname).toLowerCase())) {
                return cb(new common_1.BadRequestException('Solo se permiten imágenes JPG, PNG, WEBP o PDF'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('purchaseId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "uploadVoucher", null);
__decorate([
    (0, common_1.Get)('purchases/search'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar compras por celular o correo y ver los números comprados' }),
    __param(0, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "searchPurchases", null);
__decorate([
    (0, common_1.Get)('raffles/:raffleId/purchases'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Ver todas las compras de una rifa' }),
    __param(0, (0, common_1.Param)('raffleId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "findByRaffle", null);
__decorate([
    (0, common_1.Get)('raffles/:raffleId/top-buyers'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Ranking de clientes con más números comprados' }),
    __param(0, (0, common_1.Param)('raffleId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "topBuyers", null);
__decorate([
    (0, common_1.Get)('raffles/:raffleId/purchases/:purchaseId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Ver detalle de una compra' }),
    __param(0, (0, common_1.Param)('purchaseId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)('raffles/:raffleId/purchases/:purchaseId/approve'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Aprobar pago → envía números al cliente por email' }),
    __param(0, (0, common_1.Param)('purchaseId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)('raffles/:raffleId/purchases/:purchaseId/reject'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Rechazar comprobante → libera números y notifica al cliente' }),
    __param(0, (0, common_1.Param)('purchaseId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "reject", null);
__decorate([
    (0, common_1.Patch)('raffles/:raffleId/purchases/:purchaseId/cancel'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Cancelar compra' }),
    __param(0, (0, common_1.Param)('purchaseId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchasesController.prototype, "cancel", null);
exports.PurchasesController = PurchasesController = __decorate([
    (0, swagger_1.ApiTags)('Compras'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [purchases_service_1.PurchasesService])
], PurchasesController);
//# sourceMappingURL=purchases.controller.js.map