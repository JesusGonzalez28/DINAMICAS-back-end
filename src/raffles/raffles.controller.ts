import {
  Controller, Post, Get, Patch, Param, Body,
  UseGuards, ParseUUIDPipe, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { RafflesService } from './raffles.service';
import { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto } from './raffles.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

const prizeStorage = diskStorage({
  destination: './uploads/prizes',
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `prize-${unique}${extname(file.originalname)}`);
  },
});

@ApiTags('Rifas')
@Controller('raffles')
export class RafflesController {
  constructor(private readonly rafflesService: RafflesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las rifas' })
  findAll() { return this.rafflesService.findAll(); }

  @Get('active')
  @ApiOperation({ summary: 'Obtener la rifa activa principal' })
  getActive() { return this.rafflesService.getActive(); }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.rafflesService.findOne(id); }

  @Get(':id/stats')
  getStats(@Param('id', ParseUUIDPipe) id: string) { return this.rafflesService.getStats(id); }

  @Get(':id/blessed-numbers')
  getBlessedNumbers(@Param('id', ParseUUIDPipe) id: string) { return this.rafflesService.getBlessedNumbers(id); }

  @Get(':id/sold-numbers')
  getSoldNumbers(@Param('id', ParseUUIDPipe) id: string) { return this.rafflesService.getSoldNumbers(id); }

  @Get(':id/available-numbers')
  getAvailableNumbers(@Param('id', ParseUUIDPipe) id: string) { return this.rafflesService.getAvailableNumbers(id); }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('prizeImage', { storage: prizeStorage }))
  @ApiOperation({ summary: '[Admin] Crear rifa con imagen del premio' })
  create(@Body() dto: CreateRaffleDto, @UploadedFile() file?: Express.Multer.File) {
    return this.rafflesService.create(dto, file?.path);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('prizeImage', { storage: prizeStorage }))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRaffleDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.rafflesService.update(id, dto, file?.path);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRaffleStatusDto) {
    return this.rafflesService.updateStatus(id, dto);
  }
}
