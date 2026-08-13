import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as nodemailer from 'nodemailer';

export interface BookingUpdatedEventPayload {
  bookingId: number;
  userEmail: string;
  tourName: string;
  status: 'CONFIRMED' | 'REJECTED';
}

@Injectable()
export class MailListener {
  private readonly logger = new Logger(MailListener.name);
  private transporter: nodemailer.Transporter | null = null;

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    const host = process.env.MAIL_HOST;
    const port = Number(process.env.MAIL_PORT);
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    this.transporter = nodemailer.createTransport({
      host: host || 'smtp.mailersend.net',
      port: port,
      secure: false,
      auth: { user, pass },
    });

    return this.transporter;
  }

  @OnEvent('booking.updated')
  async handleBookingUpdatedEvent(payload: BookingUpdatedEventPayload) {
    try {
      const { bookingId, userEmail, tourName, status } = payload;

      const subject = `[Thông báo Đặt Tour #${bookingId}] Trạng thái: ${status}`;

      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Thông báo đơn đặt tour #${bookingId}</h2>
          <p>Email nhận: <strong>${userEmail}</strong></p>
          <p>Tên tour: <strong>${tourName}</strong></p>
          <p>Trạng thái: <strong>${status}</strong></p>
        </div>
      `;

      const transporter = await this.getTransporter();

      const senderName = process.env.MAIL_FROM_NAME || 'Tour Booking System';
      const senderEmail =
        process.env.MAIL_FROM_ADDRESS ||
        process.env.MAIL_USER ||
        'MS_uIpcPa@test-ywj2lpnpedpg7oqz.mlsender.net';

      const fromHeader = `"${senderName}" <${senderEmail}>`;

      await transporter.sendMail({
        from: fromHeader,
        to: userEmail,
        subject,
        html,
      });
    } catch (error) { }
  }
}
