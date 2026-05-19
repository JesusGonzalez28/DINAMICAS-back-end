import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './purchases.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

// Config de multer para guardar comprobantes
const voucherStorage = diskStorage({
  destination: './uploads/vouchers',
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `voucher-${unique}${extname(file.originalname)}`);
  },
});

@ApiTags('Compras')
@Controller()
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  // ── Públicos ───────────────────────────────────────────────────

  @Get('packages')
  @ApiOperation({ summary: 'Ver paquetes y datos de pago Nequi' })
  getPackages() {
    return this.purchasesService.getPackages();
  }

  @Post('raffles/:raffleId/purchases')
  @ApiOperation({ summary: 'Reservar números (sin pago aún)' })
  @ApiResponse({ status: 201, description: 'Números reservados, procede a pagar' })
  create(
    @Param('raffleId', ParseUUIDPipe) raffleId: string,
    @Body() dto: CreatePurchaseDto,
  ) {
    return this.purchasesService.create(raffleId, dto);
  }

  @Post('purchases/:purchaseId/voucher')
  @ApiOperation({ summary: 'Cliente sube comprobante de pago' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('voucher', {
      storage: voucherStorage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.pdf', '.webp'];
        if (!allowed.includes(extname(file.originalname).toLowerCase())) {
          return cb(new BadRequestException('Solo se permiten imágenes JPG, PNG, WEBP o PDF'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadVoucher(
    @Param('purchaseId', ParseUUIDPipe) purchaseId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Debes subir una imagen del comprobante');
    return this.purchasesService.uploadVoucher(purchaseId, file.path);
  }

  // ── Protegidos: solo admin ─────────────────────────────────────

  @Get('raffles/:raffleId/purchases')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Ver todas las compras de una rifa' })
  findByRaffle(@Param('raffleId', ParseUUIDPipe) raffleId: string) {
    return this.purchasesService.findByRaffle(raffleId);
  }

  @Get('raffles/:raffleId/purchases/:purchaseId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Ver detalle de una compra' })
  findOne(@Param('purchaseId', ParseUUIDPipe) purchaseId: string) {
    return this.purchasesService.findOne(purchaseId);
  }

  @Patch('raffles/:raffleId/purchases/:purchaseId/approve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Aprobar pago → envía números al cliente por email' })
  approve(@Param('purchaseId', ParseUUIDPipe) purchaseId: string) {
    return this.purchasesService.approvePurchase(purchaseId);
  }

  @Patch('raffles/:raffleId/purchases/:purchaseId/reject')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Rechazar comprobante → libera números y notifica al cliente' })
  reject(@Param('purchaseId', ParseUUIDPipe) purchaseId: string) {
    return this.purchasesService.rejectPurchase(purchaseId);
  }

  @Patch('raffles/:raffleId/purchases/:purchaseId/cancel')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Cancelar compra' })
  cancel(@Param('purchaseId', ParseUUIDPipe) purchaseId: string) {
    return this.purchasesService.cancelPurchase(purchaseId);
  }
}
