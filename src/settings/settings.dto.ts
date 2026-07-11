import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: '3126324715' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nequiNumber?: string;

  @ApiPropertyOptional({ example: 'Jesus David Gonzalez Tapias' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nequiName?: string;

  @ApiPropertyOptional({ example: '677-678822.78' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  bancolombiaAccount?: string;
}
