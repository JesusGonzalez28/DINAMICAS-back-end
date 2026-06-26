import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './settings.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

const qrStorage = diskStorage({
  destination: './uploads/settings',
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `qr-${unique}${extname(file.originalname)}`);
  },
});

@ApiTags('Configuración')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: '[Público] Ver datos de pago Nequi y QR actuales' })
  getPublic() {
    return this.settingsService.getPublic();
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('qrImage', { storage: qrStorage }))
  @ApiOperation({ summary: '[Admin] Actualizar número/nombre Nequi y/o subir nuevo QR' })
  update(
    @Body() dto: UpdateSettingsDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.settingsService.update(dto, file?.path);
  }
}
