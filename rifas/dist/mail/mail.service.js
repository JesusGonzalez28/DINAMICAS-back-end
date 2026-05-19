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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let MailService = MailService_1 = class MailService {
    constructor() {
        this.logger = new common_1.Logger(MailService_1.name);
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }
    async sendComprobantNotification(purchase, raffleTitle) {
        try {
            await this.transporter.sendMail({
                from: process.env.MAIL_FROM,
                to: process.env.ADMIN_EMAIL,
                subject: `🎟️ Nuevo comprobante - ${purchase.buyerName}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #CC0000; padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0;">DINÁMICAS LOS HERMANOS</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0;">Nuevo comprobante recibido</p>
            </div>
            <div style="background: #1a1a1a; padding: 24px; color: #ffffff;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #888; width: 140px;">Nombre:</td><td style="color: white; font-weight: bold;">${purchase.buyerName}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Teléfono:</td><td>${purchase.buyerPhone}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Email:</td><td>${purchase.buyerEmail}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Ciudad:</td><td>${purchase.buyerCity}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Rifa:</td><td>${raffleTitle}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Números:</td><td style="color: #CC0000; font-weight: bold; font-size: 18px;">${purchase.quantity}</td></tr>
                <tr><td style="padding: 8px 0; color: #888;">Total:</td><td style="color: #CC0000; font-weight: bold; font-size: 18px;">$${Number(purchase.totalAmount).toLocaleString('es-CO')} COP</td></tr>
              </table>
              <div style="margin-top: 16px; padding: 12px; background: #222; border-left: 4px solid #CC0000; border-radius: 4px;">
                <p style="margin: 0; color: #888; font-size: 12px;">ID de compra</p>
                <p style="margin: 4px 0 0; color: white; font-family: monospace; font-size: 11px;">${purchase.id}</p>
              </div>
            </div>
          </div>
        `,
            });
        }
        catch (err) {
            this.logger.error('Error enviando email al admin:', err);
        }
    }
    async sendNumbersToClient(purchase, tickets, raffleTitle, prize, blessedPrize) {
        try {
            const blessedTickets = tickets.filter(t => t.isBlessed);
            const hasBlessedNumbers = blessedTickets.length > 0;
            const numbersHtml = tickets
                .map(t => {
                if (t.isBlessed) {
                    return `<span style="display:inline-block; background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; padding: 6px 12px; border-radius: 6px; margin: 4px; font-family: monospace; font-size: 16px; font-weight: bold; box-shadow: 0 2px 8px rgba(255,215,0,0.5);">⭐ ${t.number}</span>`;
                }
                return `<span style="display:inline-block; background:#CC0000; color:white; padding:6px 12px; border-radius:6px; margin:4px; font-family:monospace; font-size:16px; font-weight:bold;">${t.number}</span>`;
            })
                .join('');
            const blessedSection = hasBlessedNumbers ? `
        <div style="background: linear-gradient(135deg, #FFD700, #FFA500); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <div style="font-size: 2rem;">🌟</div>
          <h2 style="color: #000; margin: 8px 0; font-size: 1.4rem;">¡GANASTE UN NÚMERO BENDECIDO!</h2>
          <p style="color: #333; margin: 0; font-size: 0.9rem;">
            Tu número <strong>${blessedTickets.map(t => t.number).join(', ')}</strong> es especial y tiene un premio adicional de
            <strong>$${Number(blessedPrize).toLocaleString('es-CO')} COP</strong>
          </p>
          <p style="color: #555; font-size: 0.8rem; margin-top: 8px;">El administrador se pondrá en contacto contigo.</p>
        </div>
      ` : '';
            await this.transporter.sendMail({
                from: process.env.MAIL_FROM,
                to: purchase.buyerEmail,
                subject: hasBlessedNumbers
                    ? `⭐ ¡GANASTE UN NÚMERO BENDECIDO! - Dinámicas Los Hermanos`
                    : `🎉 ¡Tus números de la rifa! - Dinámicas Los Hermanos`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #CC0000; padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0;">DINÁMICAS LOS HERMANOS</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0;">¡Tu pago fue confirmado!</p>
            </div>
            <div style="background: #1a1a1a; padding: 24px; color: #ffffff;">
              <h2 style="color: white;">¡Hola, ${purchase.buyerName}! 🎟️</h2>
              ${blessedSection}
              <div style="background: #222; border: 1px solid #333; border-radius: 8px; padding: 16px; margin: 16px 0;">
                <p style="color: #888; font-size: 13px; margin: 0 0 4px;">RIFA</p>
                <p style="color: white; font-size: 18px; font-weight: bold; margin: 0;">${raffleTitle}</p>
                <p style="color: #CC0000; margin: 4px 0 0;">Premio: ${prize}</p>
              </div>
              <div style="margin: 20px 0;">
                <p style="color: #888; font-size: 13px; margin-bottom: 10px;">TUS ${tickets.length} NÚMEROS <small style="color: #FFD700;">⭐ = Número Bendecido</small></p>
                <div style="line-height: 2.5;">${numbersHtml}</div>
              </div>
              <div style="background: #222; border-left: 4px solid #CC0000; padding: 12px; border-radius: 4px; margin-top: 20px;">
                <p style="margin: 0; color: #888; font-size: 11px;">ID de compra</p>
                <p style="margin: 4px 0 0; color: white; font-family: monospace; font-size: 11px;">${purchase.id}</p>
              </div>
              <p style="color: #666; font-size: 12px; margin-top: 20px; text-align: center;">¡Mucha suerte! · Dinámicas Los Hermanos</p>
            </div>
          </div>
        `,
            });
            this.logger.log(`Email enviado a ${purchase.buyerEmail} — bendecidos: ${blessedTickets.length}`);
        }
        catch (err) {
            this.logger.error('Error enviando email al cliente:', err);
        }
    }
    async sendRejectionToClient(purchase) {
        try {
            await this.transporter.sendMail({
                from: process.env.MAIL_FROM,
                to: purchase.buyerEmail,
                subject: `❌ Comprobante no aprobado - Dinámicas Los Hermanos`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #CC0000; padding: 24px; text-align: center;">
              <h1 style="color: white; margin: 0;">DINÁMICAS LOS HERMANOS</h1>
            </div>
            <div style="background: #1a1a1a; padding: 24px; color: #ffffff;">
              <h2>Hola, ${purchase.buyerName}</h2>
              <p style="color: #aaa;">Tu comprobante no pudo ser aprobado. Contáctanos por WhatsApp al <strong style="color:white;">3126324715</strong>.</p>
              <p style="color: #666; font-size: 12px;">ID: ${purchase.id}</p>
            </div>
          </div>
        `,
            });
        }
        catch (err) {
            this.logger.error('Error enviando rechazo:', err);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map