import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from '../entities/settings.entity';
import { UpdateSettingsDto } from './settings.dto';

const SETTINGS_ID = 'general';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private settingsRepo: Repository<Settings>,
  ) {}

  /**
   * Devuelve la fila única de configuración. La crea con valores por
   * defecto (tomados de variables de entorno) si todavía no existe.
   */
  async getOrCreate(): Promise<Settings> {
    let settings = await this.settingsRepo.findOne({ where: { id: SETTINGS_ID } });
    if (!settings) {
      settings = this.settingsRepo.create({
        id: SETTINGS_ID,
        nequiNumber: process.env.NEQUI_NUMBER || '3126324715',
        nequiName: process.env.NEQUI_NAME || 'Jesus David Gonzalez Tapias',
        qrImage: null,
        bancolombiaAccount: process.env.BANCOLOMBIA_ACCOUNT || '677-678822.78',
      });
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async getPublic() {
    const settings = await this.getOrCreate();
    return {
      nequiNumber: settings.nequiNumber,
      nequiName: settings.nequiName,
      qrImage: settings.qrImage,
      bancolombiaAccount: settings.bancolombiaAccount,
    };
  }

  async update(dto: UpdateSettingsDto, qrPath?: string) {
    const settings = await this.getOrCreate();
    if (dto.nequiNumber !== undefined) settings.nequiNumber = dto.nequiNumber;
    if (dto.nequiName !== undefined) settings.nequiName = dto.nequiName;
    if (dto.bancolombiaAccount !== undefined) settings.bancolombiaAccount = dto.bancolombiaAccount;
    if (qrPath) settings.qrImage = qrPath;
    return this.settingsRepo.save(settings);
  }
}
