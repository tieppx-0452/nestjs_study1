import { Test, TestingModule } from '@nestjs/testing';
import { MailListener, BookingUpdatedEventPayload } from './mail.listener';
import * as nodemailer from 'nodemailer';

describe('MailListener', () => {
  let listener: MailListener;
  let mockSendMail: jest.Mock;

  beforeEach(async () => {
    process.env.MAILTRAP_SMTP_USER = 'test-user';
    process.env.MAILTRAP_SMTP_PASS = 'test-password';
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
    jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: mockSendMail,
    } as unknown as nodemailer.Transporter);

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailListener],
    }).compile();

    listener = module.get<MailListener>(MailListener);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    delete process.env.MAILTRAP_SMTP_USER;
    delete process.env.MAILTRAP_SMTP_PASS;
  });

  it('should be defined', () => {
    expect(listener).toBeDefined();
  });

  it('should handle CONFIRMED booking event payload successfully', async () => {
    const payload: BookingUpdatedEventPayload = {
      bookingId: 1,
      userEmail: 'user@example.com',
      tourName: 'Phu Quoc Tour',
      status: 'CONFIRMED',
    };

    await listener.handleBookingUpdatedEvent(payload);

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: expect.stringContaining('CONFIRMED'),
      }),
    );
  });

  it('should handle REJECTED booking event payload successfully', async () => {
    const payload: BookingUpdatedEventPayload = {
      bookingId: 2,
      userEmail: 'user2@example.com',
      tourName: 'Ha Long Bay Tour',
      status: 'REJECTED',
    };

    await listener.handleBookingUpdatedEvent(payload);

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user2@example.com',
        subject: expect.stringContaining('REJECTED'),
      }),
    );
  });

  it('should handle CANCELLED booking event payload successfully', async () => {
    const payload: BookingUpdatedEventPayload = {
      bookingId: 3,
      userEmail: 'user3@example.com',
      tourName: 'Da Nang Tour',
      status: 'CANCELLED',
    };

    await listener.handleBookingUpdatedEvent(payload);

    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user3@example.com',
        subject: expect.stringContaining('CANCELLED'),
      }),
    );
  });
});
