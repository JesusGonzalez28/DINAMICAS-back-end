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
exports.RafflesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const passport_1 = require("@nestjs/passport");
const raffles_service_1 = require("./raffles.service");
const raffles_dto_1 = require("./raffles.dto");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_entity_1 = require("../entities/user.entity");
const prizeStorage = (0, multer_1.diskStorage)({
    destination: './uploads/prizes',
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `prize-${unique}${(0, path_1.extname)(file.originalname)}`);
    },
});
let RafflesController = class RafflesController {
    constructor(rafflesService) {
        this.rafflesService = rafflesService;
    }
    findAll() { return this.rafflesService.findAll(); }
    getActive() { return this.rafflesService.getActive(); }
    findOne(id) { return this.rafflesService.findOne(id); }
    getStats(id) { return this.rafflesService.getStats(id); }
    getBlessedNumbers(id) { return this.rafflesService.getBlessedNumbers(id); }
    getSoldNumbers(id) { return this.rafflesService.getSoldNumbers(id); }
    getAvailableNumbers(id) { return this.rafflesService.getAvailableNumbers(id); }
    create(dto, file) {
        return this.rafflesService.create(dto, file?.path);
    }
    update(id, dto, file) {
        return this.rafflesService.update(id, dto, file?.path);
    }
    updateStatus(id, dto) {
        return this.rafflesService.updateStatus(id, dto);
    }
};
exports.RafflesController = RafflesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las rifas' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener la rifa activa principal' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "getActive", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id/blessed-numbers'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "getBlessedNumbers", null);
__decorate([
    (0, common_1.Get)(':id/sold-numbers'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "getSoldNumbers", null);
__decorate([
    (0, common_1.Get)(':id/available-numbers'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "getAvailableNumbers", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('prizeImage', { storage: prizeStorage })),
    (0, swagger_1.ApiOperation)({ summary: '[Admin] Crear rifa con imagen del premio' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [raffles_dto_1.CreateRaffleDto, Object]),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('prizeImage', { storage: prizeStorage })),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, raffles_dto_1.UpdateRaffleDto, Object]),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, raffles_dto_1.UpdateRaffleStatusDto]),
    __metadata("design:returntype", void 0)
], RafflesController.prototype, "updateStatus", null);
exports.RafflesController = RafflesController = __decorate([
    (0, swagger_1.ApiTags)('Rifas'),
    (0, common_1.Controller)('raffles'),
    __metadata("design:paramtypes", [raffles_service_1.RafflesService])
], RafflesController);
//# sourceMappingURL=raffles.controller.js.map